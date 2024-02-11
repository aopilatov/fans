import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaDbRepository } from '@/db/repository';
import { DateTime } from 'luxon';
import { MEDIA_TYPE, MediaDbModel, CreatorDbModel } from '@/db/model';
import { ffprobe } from 'fluent-ffmpeg';
import * as ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import Jimp from 'jimp';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import * as _ from 'lodash';

@Injectable()
export class MediaService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mediaDbRepository: MediaDbRepository,
  ) {}

  private async download(url: string, filePath: string) {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  private async getWorkDir(): Promise<string> {
    const date = DateTime.now();
    const dirPath: string[] = [this.configService.get('upload.dir'), date.toFormat('yyyyLL'), date.toFormat('dd')];
    await fs.promises.mkdir(path.join(...dirPath), { recursive: true });
    return path.join(...dirPath);
  }

  private ffprobeSync(file: string) {
    return new Promise((resolve, reject) => {
      ffprobe(file, (err, metadata) => {
        if (err) {
          return reject(new Error(err))
        } else {
          return resolve(metadata);
        }
      });
    });
  }

  private ffmpegScreenshotSync(video: string, workDir: string, name: string, width: number, height: number) {
    return new Promise((resolve, reject) => {
      ffmpeg(video)
        .on('end', () => {
          return resolve(true);
        })
        .on('error', (err) => {
          return reject(new Error(err));
        })
        .screenshot({
          count: 1,
          filename: `${name}_origin.png`,
          timestamps: ['50%'],
          folder: workDir,
          size: `${width}x${height}`,
        });
    });
  }

  private async saveImage(image: Jimp, mediaUuid: string, withResized: boolean = true, withBlurred: boolean = true, postCheck?: (image: Jimp) => void | Promise<void>): Promise<string> {
    try {
      if (postCheck) await postCheck(image);

      const originWidth = image.getWidth();
      const originHeight = image.getHeight();

      const squareSize = originHeight > originWidth ? originWidth: originHeight;
      const imageSquared = image.clone().cover(squareSize, squareSize);
      const imageBlurred = imageSquared.clone().blur(60);

      const workDir = await this.getWorkDir();
      const uuidBlurred = crypto.randomUUID();

      const images = [
        () => image.writeAsync(path.join(workDir, `${mediaUuid}.png`)),
      ];

      if (withResized) {
        images.push(() => imageSquared.resize(200, 200).writeAsync(path.join(workDir, `${mediaUuid}_200.png`)));
      }

      if (withBlurred) {
        images.push(() => imageBlurred.resize(200, 200).writeAsync(path.join(workDir, `${uuidBlurred}_200.png`)));
      }

      await Promise.all(images.map(item => item()));
      const fileShortDir = workDir.replace(this.configService.get('upload.dir'), '');

      const media = await this.mediaDbRepository.create(
        mediaUuid, MEDIA_TYPE.IMAGE, originWidth, originHeight,
        `${fileShortDir}/${mediaUuid}.png`,
        `${fileShortDir}/${mediaUuid}_200.png`,
        `${fileShortDir}/${uuidBlurred}_200.png`,
      );

      return media.uuid;
    } catch (e: unknown) {
      console.log('err image upload', e);
      throw e;
    }
  }

  public async imageFromUrl(url: string, withResized: boolean = true, withBlurred: boolean = true, postCheck?: (image: Jimp) => void | Promise<void>): Promise<string> {
    const mediaUuid = crypto.randomUUID();
    const fileTmp = path.join(os.tmpdir(), mediaUuid);

    await this.download(url, fileTmp);
    const image = await Jimp.read(fileTmp);

    return this.saveImage(image, mediaUuid, withResized, withBlurred, postCheck);
  }

  public async imageFromUpload(buf: Buffer, withResized: boolean = true, withBlurred: boolean = true, postCheck?: (image: Jimp) => void | Promise<void>): Promise<string> {
    const mediaUuid = crypto.randomUUID();
    const fileTmp = path.join(os.tmpdir(), mediaUuid);

    await fs.promises.writeFile(fileTmp, buf);
    const image = await Jimp.read(fileTmp);

    return this.saveImage(image, mediaUuid, withResized, withBlurred, postCheck);
  }

  public async videoFromUpload(buf: Buffer): Promise<string> {
    const mediaUuid = crypto.randomUUID();
    const uuidBlurred = crypto.randomUUID();

    const fileTmp = path.join(os.tmpdir(), mediaUuid);
    const workDir = await this.getWorkDir();
    const fileShortDir = workDir.replace(this.configService.get('upload.dir'), '');

    await fs.promises.writeFile(fileTmp, buf);
    const metadata = await this.ffprobeSync(fileTmp);
    const streamMetadata = _.get(metadata, 'streams', []).find(stream => stream.codec_type === 'video');
    const originWidth = _.get(streamMetadata, 'width', 0);
    const originHeight = _.get(streamMetadata, 'height', 0);
    const name = `${mediaUuid}.${_.get(metadata, 'format.format_name', 'mov').split(',')[0]}`;

    await fs.promises.copyFile(fileTmp, path.join(workDir, name));
    await this.ffmpegScreenshotSync(fileTmp, workDir, mediaUuid, originWidth, originHeight);

    const image = await Jimp.read(path.join(workDir, `${mediaUuid}_origin.png`));
    const imageSquared = image.clone().cover(1000, 1000);
    const imageBlurred = imageSquared.clone().blur(60);

    await imageSquared.resize(200, 200).writeAsync(path.join(workDir, `${mediaUuid}_200.png`));
    await imageBlurred.resize(200, 200).writeAsync(path.join(workDir, `${uuidBlurred}_200.png`));

    const media = await this.mediaDbRepository.create(
      mediaUuid, MEDIA_TYPE.VIDEO, originWidth, originHeight,
      `${fileShortDir}/${name}`,
      `${fileShortDir}/${mediaUuid}_200.png`,
      `${fileShortDir}/${uuidBlurred}_200.png`
    );

    return media.uuid;
  }

  public async getByUuid(uuid: string): Promise<MediaDbModel> {
    return this.mediaDbRepository.findByUuid(uuid);
  }

  public async getByUuids(uuids: string[]): Promise<MediaDbModel[]> {
    return this.mediaDbRepository.findByUuids(uuids);
  }

  public async getByCreator(creator: CreatorDbModel, type: MEDIA_TYPE): Promise<Record<string, any>[]> {
    return this.mediaDbRepository.findByCreator(creator, type);
  }

  public convertObjectToModel(obj: Record<string, any>): MediaDbModel {
    return {
      uuid: _.get(obj, 'uuid'),
      type: _.get(obj, 'type'),
      width: _.get(obj, 'width'),
      height: _.get(obj, 'height'),
      origin: _.get(obj, 'origin'),
      none200: _.get(obj, 'none_200'),
      blur200: _.get(obj, 'blur_200'),
      createdAt: DateTime.fromISO(_.get(obj, 'created_at')).toJSDate(),
    };
  }
}
