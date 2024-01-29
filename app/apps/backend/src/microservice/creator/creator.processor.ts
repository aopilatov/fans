import { Process, Processor, OnQueueStalled, OnQueueError, OnQueueActive } from '@nestjs/bull';
import { forwardRef, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Job } from 'bull';
import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { TelegramService } from '@/microservice/telegram';
import { UserService } from '@/microservice/user';
import { MediaDbModel, UserDbModel } from '@/db/model';
import { CreatorDbRepository } from '@/db/repository';
import { AuthService } from '@/microservice/auth';
import { AgencyAdminService } from '@/microservice/agencyAdmin';
import { SubscriptionLevelService } from '@/microservice/subscriptionLevel';
import { MediaService } from '@/microservice/media';
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
    @Inject(forwardRef(() => SubscriptionLevelService)) protected readonly subscriptionLevelService: SubscriptionLevelService,
    private readonly creatorDbRepository: CreatorDbRepository,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly telegramService: TelegramService,
    private readonly agencyAdminService: AgencyAdminService,
    protected readonly mediaService: MediaService,

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
    // if (userTgId) await this.telegramService.flushCallbacks(userTgId);
  }

  @Process('auth')
  public async getToken(job: Job): Promise<string> {
    const userUuid = _.get(job, 'data.uuid');
    const creatorUuid = _.get(job, 'data.creator');
    const userTgToken = _.get(job, 'data.check');

    if (!userUuid || !userTgToken) {
      return null;
    }

    const user = await this.userService.getByUuid(userUuid);
    if (!user) return;

    const creator = await this.creatorDbRepository.findByUserAndUuid(user, creatorUuid);
    if (!creator) return;

    return this.authService.tokenForCreator(user, creator);
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

      const data = [];

      const creators = await this.creatorDbRepository.findByUser(user);
      for (const item of creators) {
        data.push([{
          text: item.login,
          callback_data: await this.telegramService.registerCallback(user, 'creator_profile_menu', { creator: item.uuid }),
        }]);
      }

      const adminAgencies = await this.agencyAdminService.getListByUser(user);
      if (adminAgencies?.length) {
        const creatorsForAgencies = await this.creatorDbRepository.findByAgencyUuids(adminAgencies.map(item => item.agencyUuid));
        for (const item of creatorsForAgencies) {
          data.push([{
            text: item.login,
            callback_data: await this.telegramService.registerCallback(user, 'creator_profile_menu', { creator: item.uuid, agency: item.agencyUuid }),
          }]);
        }
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
      const contextAgency = _.get(job, 'data.system.cmd.context.agency');

      let keyboard = [
        [{ text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, 'creator_profile_fetch_all') }],
        [{ text: '📚 Posts', callback_data: await this.telegramService.registerCallback(user, 'post_get_menu', { creator: contextProfile }) }],
        [{ text: '💰 Subscription prices', callback_data: await this.telegramService.registerCallback(user, 'subscription_level_fetch_all', { creator: contextProfile }) }],
      ];

      if (!contextAgency) {
        keyboard[1].push({ text: '💰 Wallet', callback_data: await this.telegramService.registerCallback(user, 'creator_profile_wallet_menu', { creator: contextProfile }) });
        keyboard.push([{ text: '⚡️ Producer', callback_data: await this.telegramService.registerCallback(user, 'agency_retrieve_creator_agency', { creator: contextProfile }) }]);
      }

      keyboard = [
        ...keyboard,
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

  @Process('get_creator')
  public async getCreatorProfile(job: Job): Promise<Record<string, any>> {
    const inputLogin = _.get(job, 'data.login');
    if (!inputLogin) return;

    const creator = await this.creatorDbRepository.findByLogin(inputLogin.toLowerCase());
    if (!creator) return;

    const levels = await this.subscriptionLevelService.getForCreator(creator);

    let maxLevel = 1;
    for (const level of levels) {
      if (level.level > maxLevel) maxLevel = level.level;
    }

    const data = {
      login: creator.login,
      name: creator.name,
      isVerified: creator.isVerified,
      infoShort: creator.infoShort,
      infoLong: creator.infoLong,
      levels: levels.map(item => ({
        level: item.level,
        price: item.price,
      })),
      maxLevel,
    };

    let images: MediaDbModel[] = [];
    if (creator?.image) {
      images = await this.mediaService.getByMediaUuid(creator.image);
      images = images.filter(item => item.transformation === 'none');
      images.sort((a, b) => a.width - b.width);
    }
    _.set(data, 'image', images.map(item => _.pick(item, ['file', 'width', 'height'])));

    let artworks: MediaDbModel[] = [];
    if (creator?.artwork) {
      artworks = await this.mediaService.getByMediaUuid(creator.artwork);
      artworks = artworks.filter(item => item.transformation === 'none');
      artworks.sort((a, b) => a.width - b.width);
    }
    _.set(data, 'artwork', artworks.map(item => _.pick(item, ['file', 'width', 'height'])));

    return data;
  }
}
