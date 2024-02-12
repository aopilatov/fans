import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { TelegramService } from '@/microservice/telegram';
import { forwardRef, Inject } from '@nestjs/common';
import { UserDbModel } from '@/db/model';
import { InputMedia } from 'node-telegram-bot-api';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import * as _ from 'lodash';
import * as path from 'path';

@Processor('event')
export class EventProcessor {
  constructor(
    @Inject(forwardRef(() => TelegramService)) private readonly telegramService: TelegramService,
    private readonly configService: ConfigService,
  ) {}

  @Process('postExport')
  public async postExport(job: Job) {
    const user: UserDbModel = _.get(job, 'data.user');
    const post: Record<string, any> = _.get(job, 'data.post');

    const message = `${post.creator.login}: ${post.content.text}`;

    const content = [ /*...(post.content?.image || []),*/ ...(post.content?.video || []), ];
    if (content.length) {
      try {
        // todo: change node-telegram-bot-api to own mtproto bot, to allow big files uploading
        const media = await Promise.all(content.map((item, index) => {
          const fn = item.type === 'image' ? 'sendPhoto' : 'sendVideo';
          const file =  createReadStream(path.join(this.configService.get<string>('upload.dir'), item.origin));
          return _.invoke(this.telegramService.botMain, fn, user.userTgId, file, {
            disable_notification: true,
            protect_content: true,
          }).then(async (data) => {
            await this.telegramService.botMain.deleteMessage(user.userTgId, data?.message_id);
            return { ...data, fan_index: index, fan_type: item.type };
          });
        }));

        const files: InputMedia[] = media.map(item => ({
          type: item.fan_type === 'image' ? 'photo' : 'video',
          media: item.photo[item.photo.length - 1].file_id,
          caption: item.fan_index === 0 ? message : undefined,
        }));

        await this.telegramService.botMain.sendMediaGroup(
          user.userTgId,
          files,
        );
      } catch (e) {
        console.error(e);
      }
    }
  }
}
