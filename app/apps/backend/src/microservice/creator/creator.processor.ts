import { Process, Processor, OnQueueStalled, OnQueueError, OnQueueActive } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Job } from 'bull';
import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { TelegramService } from '@/microservice/telegram';
import { UserService } from '@/microservice/user';
import { CreatorDbModel, UserDbModel } from '@/db/model';
import { CreatorDbRepository } from '@/db/repository';
import { CreatorService } from './creator.service';
import { Cache } from 'cache-manager';
import * as _ from 'lodash';

import { CreatorInputCreate } from './creator.input.create';
import { CreatorInputChangeName } from './creator.input.changeName';
import { CreatorInputChangeLogin } from './creator.input.changeLogin';
import { CreatorInputChangeInfoShort } from './creator.input.changeInfoShort';
import { CreatorInputChangeInfoLong } from './creator.input.changeInfoLong';
import { CreatorInputChangeImage } from './creator.input.changeImage';
import { CreatorInputChangeArtwork } from './creator.input.changeArtwork';

@Processor('creator')
export class CreatorProcessor {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly creatorDbRepository: CreatorDbRepository,
    private readonly creatorService: CreatorService,
    private readonly userService: UserService,
    private readonly telegramService: TelegramService,

    private readonly creatorInputCreate: CreatorInputCreate,
    private readonly creatorInputChangeName: CreatorInputChangeName,
    private readonly creatorInputChangeLogin: CreatorInputChangeLogin,
    private readonly creatorInputChangeInfoShort: CreatorInputChangeInfoShort,
    private readonly creatorInputChangeInfoLong: CreatorInputChangeInfoLong,
    private readonly creatorInputChangeImage: CreatorInputChangeImage,
    private readonly creatorInputChangeArtwork: CreatorInputChangeArtwork,
  ) {}

  private async cleanAllProcesses(user: UserDbModel): Promise<void> {
    const keys = await this.cacheService.store.keys(`input:*:${user.uuid}`);
    for (const key of keys) {
      await this.cacheService.del(key);
    }
  }

  @OnQueueStalled()
  @OnQueueError()
  public async OnQueueError(job: Job): Promise<void> {
    try {
      console.error('stalled', job.id);
      await job.remove();
    } catch (e: unknown) {
      console.error(e);
    }
  }

  @OnQueueActive()
  public async onProgress(job: Job): Promise<void> {
    const userTgId = parseInt(_.get(job, 'data.from.id', ''));
    if (userTgId) await this.telegramService.flushCallbacks(userTgId);
  }

  @Process('process')
  public async processHandler(job: Job): Promise<void> {
    try {
      const user: UserDbModel = _.get(job.data, 'user');

      const process = await this.cacheService.get<any>(`input:creator:${user.uuid}`);
      if (!process || !process?.type) return;

      switch (process.type) {
        case 'create':
          await this.creatorInputCreate.proceed(user, job.data, process);
          break;
        case 'profile_edit_name':
          await this.creatorInputChangeName.proceed(user, job.data, process);
          break;
        case 'profile_edit_login':
          await this.creatorInputChangeLogin.proceed(user, job.data, process);
          break;
        case 'profile_edit_info_short':
          await this.creatorInputChangeInfoShort.proceed(user, job.data, process);
          break;
        case 'profile_edit_info_long':
          await this.creatorInputChangeInfoLong.proceed(user, job.data, process);
          break;
        case 'profile_edit_image':
          await this.creatorInputChangeImage.proceed(user, job.data, process);
          break;
        case 'profile_edit_artwork':
          await this.creatorInputChangeArtwork.proceed(user, job.data, process);
          break;
      }

      return;
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('get_menu')
  public async getMenu(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      await this.cleanAllProcesses(user);

      const keyboard = [[
        { text: 'My profiles', callback_data: await this.telegramService.registerCallback(user, 'creator_profile_fetch_all') },
        { text: 'Create profile', callback_data: await this.telegramService.registerCallback(user, 'creator_profile_create') },
      ]];

      const messageId = _.get(job.data, 'message.message_id');
      if (!messageId) {
        await this.telegramService.botCreator.sendMessage(user.userTgId, 'Actions', {
          reply_markup: {
            inline_keyboard: keyboard,
          },
        });
      } else {
        await this.telegramService.botCreator.editMessageText('Actions', {
          chat_id: user.userTgId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: keyboard,
          },
        })
      }

    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('profile_fetch_all')
  public async getProfiles(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      await this.cleanAllProcesses(user);

      const creators = await this.creatorDbRepository.findByUser(user);
      const data = [];
      for (const item of creators) {
        data.push([{
          text: item.login,
          callback_data: await this.telegramService.registerCallback(user, 'creator_profile_menu', { creator: item.uuid }),
        }]);
      }

      const keyboard: InlineKeyboardButton[][] = [
        [{ text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, 'start_back') }],
        ...data,
      ];

      await this.telegramService.botCreator.editMessageText(creators.length > 0 ? 'Your profiles' : 'You do not have profiles yet', {
        chat_id: user.userTgId,
        message_id: _.get(job.data, 'message.message_id'),
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('profile_create')
  public async create(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      await this.creatorInputCreate.proceed(user, job.data);
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('profile_menu')
  public async getProfileMenu(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      await this.cleanAllProcesses(user);

      const contextProfile = _.get(job, 'data.system.cmd.context.creator');
      const keyboard = [
        [{ text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, 'creator_profile_fetch_all') }],
        [{ text: '💰 Subscription prices', callback_data: await this.telegramService.registerCallback(user, 'subscription_level_fetch_all', { creator: contextProfile }) }],
        [{ text: '⚡️ Producer', callback_data: await this.telegramService.registerCallback(user, 'agency_retrieve_creator_agency', { creator: contextProfile }) }],
        [
          { text: 'Change name', callback_data: await this.telegramService.registerCallback(user, 'creator_profile_edit_name', { creator: contextProfile }) },
          { text: 'Change login', callback_data: await this.telegramService.registerCallback(user, 'creator_profile_edit_login', { creator: contextProfile }) }
        ],
        [{ text: 'Edit short info', callback_data: await this.telegramService.registerCallback(user, 'creator_profile_edit_info_short', { creator: contextProfile }) }],
        [{ text: 'Edit full description', callback_data: await this.telegramService.registerCallback(user, 'creator_profile_edit_info_long', { creator: contextProfile }) }],
        [
          { text: 'Edit image', callback_data: await this.telegramService.registerCallback(user, 'creator_profile_edit_image', { creator: contextProfile }) },
          { text: 'Edit banner', callback_data: await this.telegramService.registerCallback(user, 'creator_profile_edit_artwork', { creator: contextProfile }) },
        ],
      ];

      const creator = await this.creatorDbRepository.findByUserAndUuid(user, contextProfile);
      const message = [
        `Nickname: ${creator.login}`,
        `Name: ${creator.name}`,
        `Image: ${creator?.image ? '<Uploaded>' : '<Not uploaded>'}`,
        `Banner: ${creator?.artwork ? '<Uploaded>' : '<Not uploaded>'}`,
        `Short info: ${creator?.infoShort || '<Not filled>'}`,
        `Full description: ${creator?.infoLong || '<Not filled>'}`,
      ];

      await this.telegramService.botCreator.editMessageText(message.join('\n'), {
        chat_id: user.userTgId,
        message_id: _.get(job.data, 'message.message_id'),
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('profile_edit_name')
  public async editProfileName(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      await this.creatorInputChangeName.proceed(user, job.data);
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('profile_edit_login')
  public async editProfileLogin(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      await this.creatorInputChangeLogin.proceed(user, job.data);
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('profile_edit_info_short')
  public async editProfileInfoShort(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      await this.creatorInputChangeInfoShort.proceed(user, job.data);
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('profile_edit_info_long')
  public async editProfileInfoLong(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      await this.creatorInputChangeInfoLong.proceed(user, job.data);
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('profile_edit_image')
  public async editProfileImage(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      await this.creatorInputChangeImage.proceed(user, job.data);
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('profile_edit_artwork')
  public async editProfileArtwork(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      await this.creatorInputChangeArtwork.proceed(user, job.data);
    } catch (e: unknown) {
      console.log(e);
    }
  }
}
