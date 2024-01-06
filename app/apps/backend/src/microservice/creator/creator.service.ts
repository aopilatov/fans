import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { UserDbModel } from '@/db/model';
import { TelegramService } from '@/microservice/telegram';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CreatorDbRepository } from '@/db/repository';
import { ConfigService } from '@nestjs/config';
import * as https from 'node:https';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as _ from 'lodash';

@Injectable()
export class CreatorService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @InjectQueue('user') private readonly userQueue: Queue,
    private readonly configService: ConfigService,
    private readonly telegramService: TelegramService,
    private readonly creatorDbRepository: CreatorDbRepository,
  ) {}

  public async getUser(data: Record<string, any>): Promise<UserDbModel> {
    const userJob = await this.userQueue.add('get_user', data);
    return userJob.finished();
  }

  public async handleProcessChangeImage(user: UserDbModel, data: Record<string, any>, process: Record<string, any>): Promise<void> {
    await this.telegramService.botCreator.deleteMessage(process.userTgId, _.get(data, 'message_id'));

    let keyboard = [[
      { text: '⬅️ Back', callback_data: `profile_actions_${process.context}` },
    ]];

    let list = [false, process];
    let images = _.get(data, 'photo');
    if (!images && _.has(data, 'document.thumb')) images = [_.get(data, 'document.thumb')];

    if (images && images.length > 0) {
      if (images[0].width !== images[0].height) {
        await this.telegramService.botCreator.editMessageText(`Image has different width and height, please upload another one!`, {
          chat_id: process.userTgId,
          message_id: process.messageId,
          reply_markup: {
            inline_keyboard: keyboard,
          },
        });
      } else {
        const selectedId = images[images.length - 1].file_id;
        const url = await this.telegramService.botCreator.getFileLink(selectedId);

        const file = fs.createWriteStream(path.join(this.configService.get<string>('upload.dir'), `${selectedId}.jpg`));
        https.get(url, (res) => {
          res.pipe(file);

          file.on("finish", () => {
            file.close();
            console.log("Download Completed");
          });
        });
        _.set(process, 'image', images);
        list = [true, process];
      }
    }

    // {
    //   "file_id": "AgACAgIAAxkBAAIBAWWUcrf_fB7JwnUZKnjTbnAcv_YeAAL82zEb2VehSNdvZeRPGsyWAQADAgADcwADNAQ",
    //   "file_unique_id": "AQAD_NsxG9lXoUh4",
    //   "file_size": 1521,
    //   "width": 90,
    //   "height": 90
    // }

    const [success, result] = list;
    if (!success) {
      await this.cacheService.set(`creator.process.${user.uuid}`, result, 3600000);
      return;
    }

    keyboard = [[
      { text: '⬅️ Back', callback_data: `profile_actions_${process.context}` },
    ]];

    const creator = await this.creatorDbRepository.findByUserAndLogin(user, process.context);
    await this.creatorDbRepository.update({ ...creator, image: process.image });
    await this.cacheService.del(`creator.process.${user.uuid}`);
    await this.telegramService.botCreator.editMessageText(`Image successfully updated!`, {
      chat_id: process.userTgId,
      message_id: process.messageId,
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });

    return;
  }
}
