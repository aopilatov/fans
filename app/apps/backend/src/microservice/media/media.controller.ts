import { Controller, UseInterceptors, UseGuards, Post, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { FileFieldsInterceptor, MemoryStorageFile, UploadedFiles } from '@blazity/nest-file-fastify';
import { CreatorGuard } from '@/guard/creator.guard';
import { MediaService } from './media.service';
import { MediaDbRepository } from '@/db/repository';
import * as _ from 'lodash';
import { MediaDbModel } from '@/db/model';

@Controller('/media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly mediaDbRepository: MediaDbRepository,
  ) {}

  @UseGuards(CreatorGuard)
  @Post('/image')
  @UseInterceptors(FileFieldsInterceptor([{
    name: 'image',
    maxCount: 20,
  }]))
  public async uploadImage(
    @UploadedFiles() files: MemoryStorageFile[],
    @Res() res: FastifyReply,
  ): Promise<any> {
    const images: string[] = await Promise.all(_.get(files, 'image', []).map(item => this.mediaService.imageFromUpload(item.buffer)));
    const mediaRows = await this.mediaDbRepository.findByMediaUuids(images);
    const media: Record<string, MediaDbModel> = {};
    for (const mediaRow of mediaRows) {
      if (!_.has(media, mediaRow.mediaUuid)) _.set(media, mediaRow.mediaUuid, media[mediaRow.mediaUuid]);
      const curWidth = _.get(media, `${mediaRow.mediaUuid}.width`, 0) as number;
      if (mediaRow.width > curWidth && mediaRow.transformation === 'none') {
        media[mediaRow.mediaUuid] = mediaRow;
      }
    }

    return res.code(200)
      .header('Content-Type', 'application/json')
      .send({ images: Object.values(media).map(item => _.pick(item, ['mediaUuid', 'width', 'height', 'file'])) });
  }

  @UseGuards(CreatorGuard)
  @Post('/video')
  @UseInterceptors(FileFieldsInterceptor([{
    name: 'video',
    maxCount: 20,
  }]))
  public async uploadVideo(
    @UploadedFiles() files: MemoryStorageFile[],
    @Res() res: FastifyReply,
  ) {
    let videos = _.get(files, 'video', []);
    videos = videos.filter(item => ['video/mp4', 'video/quicktime'].includes(item.mimetype));
    videos = await Promise.all(videos.map(item => this.mediaService.videoFromUpload(item.buffer)));

    const mediaRows = await this.mediaDbRepository.findByMediaUuids(videos);
    const media: Record<string, MediaDbModel> = {};
    for (const mediaRow of mediaRows) {
      if (!_.has(media, mediaRow.mediaUuid)) _.set(media, mediaRow.mediaUuid, media[mediaRow.mediaUuid]);
      const curWidth = _.get(media, `${mediaRow.mediaUuid}.width`, 0) as number;
      if (mediaRow.width > curWidth && mediaRow.transformation === 'none') {
        media[mediaRow.mediaUuid] = mediaRow;
      }
    }

    return res.code(200)
      .header('Content-Type', 'application/json')
      .send({ videos: Object.values(media).map(item => _.pick(item, ['mediaUuid', 'width', 'height', 'file'])) });
  }
}
