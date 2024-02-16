import { Controller, Post, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { FileFieldsInterceptor, MemoryStorageFile, UploadedFiles } from '@blazity/nest-file-fastify';
import { CreatorGuard } from '@/guard/creator.guard';
import { MediaService } from './media.service';
import * as _ from 'lodash';

@Controller('/media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
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
    const mediaRows = await this.mediaService.getByUuids(images);

    return res.code(200)
      .header('Content-Type', 'application/json')
      .send({ images: mediaRows });
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
    const mediaRows = await this.mediaService.getByUuids(videos);

    return res.code(200)
      .header('Content-Type', 'application/json')
      .send({ videos: mediaRows });
  }
}
