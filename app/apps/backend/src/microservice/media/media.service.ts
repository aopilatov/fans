import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaDbRepository } from '@/db/repository';
import { DateTime } from 'luxon';
import { MEDIA_TYPE, MEDIA_TRANSFORMATION } from '@/db/model';
import axios from 'axios';
import Jimp from 'jimp';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

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

  public async imageFromUrl(url: string, withResized: boolean = true, withBlurred: boolean = true, postCheck?: (image: Jimp) => void | Promise<void>): Promise<string> {
    const mediaUuid = crypto.randomUUID();
    const fileTmp = path.join(os.tmpdir(), mediaUuid);

    try {
      await this.download(url, fileTmp);
      const image = await Jimp.read(fileTmp);

      if (postCheck) await postCheck(image);

      const imageBlurred = image.clone().blur(60);
      const originWidth = image.getWidth();
      const originHeight = image.getHeight();
      const coef = originWidth / originHeight;
      const workDir = await this.getWorkDir();

      const uuidBlurred = crypto.randomUUID();

      const images = [
        () => image.writeAsync(path.join(workDir, `${mediaUuid}.png`)),
      ];

      if (withResized) {
        images.push(...[
          () => image.resize(1000, 1000 / coef).writeAsync(path.join(workDir, `${mediaUuid}_1000.png`)),
          () => image.resize(200, 200 / coef).writeAsync(path.join(workDir, `${mediaUuid}_200.png`)),
          () => image.resize(100, 100 / coef).writeAsync(path.join(workDir, `${mediaUuid}_100.png`)),
        ]);
      }

      if (withBlurred) {
        images.push(...[
          () => imageBlurred.writeAsync(path.join(workDir, `${uuidBlurred}.png`)),
        ]);

        if (withResized) {
          images.push(...[
            () => imageBlurred.resize(1000, 1000 / coef).writeAsync(path.join(workDir, `${uuidBlurred}_1000.png`)),
            () => imageBlurred.resize(200, 200 / coef).writeAsync(path.join(workDir, `${uuidBlurred}_200.png`)),
            () => imageBlurred.resize(100, 100 / coef).writeAsync(path.join(workDir, `${uuidBlurred}_100.png`)),
          ]);
        }
      }

      await Promise.all(images.map(item => item()));

      const dbRows = [
        () => this.mediaDbRepository.create(mediaUuid, MEDIA_TYPE.IMAGE, MEDIA_TRANSFORMATION.NONE, originWidth, originHeight, `${workDir}/${mediaUuid}.png`),
      ];

      if (withResized) {
        dbRows.push(...[
          () => this.mediaDbRepository.create(mediaUuid, MEDIA_TYPE.IMAGE, MEDIA_TRANSFORMATION.NONE, 100, 100 / coef, `${workDir}/${mediaUuid}_100.png`),
          () => this.mediaDbRepository.create(mediaUuid, MEDIA_TYPE.IMAGE, MEDIA_TRANSFORMATION.NONE, 200, 200 / coef, `${workDir}/${mediaUuid}_200.png`),
          () => this.mediaDbRepository.create(mediaUuid, MEDIA_TYPE.IMAGE, MEDIA_TRANSFORMATION.NONE, 1000, 1000 / coef, `${workDir}/${mediaUuid}_1000.png`),
        ]);
      }

      if (withBlurred) {
        dbRows.push(...[
          () => this.mediaDbRepository.create(mediaUuid, MEDIA_TYPE.IMAGE, MEDIA_TRANSFORMATION.BLUR, originWidth, originHeight, `${workDir}/${uuidBlurred}.png`),
        ]);

        if (withResized) {
          dbRows.push(...[
            () => this.mediaDbRepository.create(mediaUuid, MEDIA_TYPE.IMAGE, MEDIA_TRANSFORMATION.BLUR, 100, 100 / coef, `${workDir}/${uuidBlurred}_100.png`),
            () => this.mediaDbRepository.create(mediaUuid, MEDIA_TYPE.IMAGE, MEDIA_TRANSFORMATION.BLUR, 200, 200 / coef, `${workDir}/${uuidBlurred}_200.png`),
            () => this.mediaDbRepository.create(mediaUuid, MEDIA_TYPE.IMAGE, MEDIA_TRANSFORMATION.BLUR, 1000, 1000 / coef, `${workDir}/${uuidBlurred}_1000.png`),
          ]);
        }
      }

      await Promise.all(dbRows.map(item => item()));

      return mediaUuid;
    } catch (e: unknown) {
      console.log('err image upload', e);
      throw e;
    }
  }
}
