import { forwardRef, Inject } from '@nestjs/common';
import { Process, Processor, OnQueueStalled, OnQueueError, OnQueueActive } from '@nestjs/bull';
import { Job } from 'bull';
import { TelegramService } from '@/microservice/telegram';
import { UserService } from '@/microservice/user';
import { CreatorService } from '@/microservice/creator';
import { SubscriptionLevelService } from './subscriptionLevel.service';
import { UserDbModel } from '@/db/model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SubscriptionLevelDbRepository } from '@/db/repository';
import { DateTime } from 'luxon';
import * as _ from 'lodash';

import { SubscriptionLevelInputAdd } from './subscriptionLevel.input.add';

@Processor('subscriptionLevel')
export class SubscriptionLevelProcessor {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject(forwardRef(() => CreatorService)) private readonly creatorService: CreatorService,
    @Inject(forwardRef(() => TelegramService)) private readonly telegramService: TelegramService,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    private readonly subscriptionLevelDbRepository: SubscriptionLevelDbRepository,
    private readonly subscriptionLevelService: SubscriptionLevelService,

    private readonly subscriptionLevelInputAdd: SubscriptionLevelInputAdd,
  ) {}

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

  @Process('process')
  public async processHandler(job: Job): Promise<void> {
    try {
      const user: UserDbModel = _.get(job.data, 'user');

      const process = await this.cacheService.get<any>(`input:subscription_level:${user.uuid}`);
      if (!process || !process?.type) return;

      switch (process.type) {
        case 'subscription_level_create':
          await this.subscriptionLevelInputAdd.proceed(user, job.data, process);
          break;
      }

      return;
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('level_fetch_all')
  public async getSubscriptionLevels(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      const creator = await this.creatorService.getCreator(user, _.get(job.data, 'system.cmd.context.creator'));
      const levels = await this.subscriptionLevelService.getByCreator(creator);
      levels.sort((a,b) => a.price - b.price);

      const data = [];
      for (const item of levels) {
        const isDeleted = !item?.deletedAt ? '' : ' (Archive)';
        data.push([{
          text: item.price ? `${item.level})${isDeleted} ${item.price} USDT` : `${item.level}) Free`,
          callback_data: await this.telegramService.registerCallback(user, 'subscription_level_retrieve',  { creator: creator.uuid, level: item.uuid }),
        }]);
      }

      const keyboard = [
        [
          { text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, 'creator_profile_menu', { creator: creator.uuid }) },
          { text: '❇️ Add price', callback_data: await this.telegramService.registerCallback(user, 'subscription_level_create', { creator: creator.uuid }) },
        ],
        ...data,
      ];

      await this.telegramService.botCreator.editMessageText('Subscription prices', {
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

  @Process('level_retrieve')
  public async getSubscriptionLevel(job: Job): Promise<void> {
    const user = await this.userService.getOrCreate(job.data);
    if (!user) return;

    const creator = await this.creatorService.getCreator(user, _.get(job.data, 'system.cmd.context.creator'));
    const level = await this.subscriptionLevelDbRepository.findByUuid(_.get(job.data, 'system.cmd.context.level'));

    const keyboard = [
      [{ text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, 'subscription_level_fetch_all', { creator: creator.uuid }) }],
    ];

    if (level.price > 0) {
      keyboard[0].push({
        text: !level?.deletedAt ? '🗑️ Archive it' : '📇 Restore it',
        callback_data: await this.telegramService.registerCallback(user, !level?.deletedAt ? 'subscription_level_archive' : 'subscription_level_unarchive', { creator: creator.uuid, level: level.uuid }),
      });
    }

    let message = `Manage subscription price (${level.price} USDT)`;
    if (level.price === 0) message = 'Can not edit free plan';

    await this.telegramService.botCreator.editMessageText(message, {
      chat_id: user.userTgId,
      message_id: _.get(job.data, 'message.message_id'),
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  @Process('level_create')
  public async addSubscriptionLevel(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      await this.subscriptionLevelInputAdd.proceed(user, job.data);
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('level_archive')
  public async archiveSubscriptionLevel(job: Job): Promise<void> {
    const user = await this.userService.getOrCreate(job.data);
    if (!user) return;

    const creator = await this.creatorService.getCreator(user, _.get(job.data, 'system.cmd.context.creator'));
    const level = await this.subscriptionLevelDbRepository.findByUuid(_.get(job.data, 'system.cmd.context.level'));
    await this.subscriptionLevelDbRepository.update({ ...level, deletedAt: DateTime.now().toJSDate() });
    await this.subscriptionLevelService.updateCreatorMaxLevel(creator);

    const keyboard = [
      [{ text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, 'subscription_level_fetch_all', { creator: creator.uuid }) }],
    ];

    await this.telegramService.botCreator.editMessageText('Subscription plan was successfully archived', {
      chat_id: user.userTgId,
      message_id: _.get(job.data, 'message.message_id'),
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  @Process('level_unarchive')
  public async unarchiveSubscriptionLevel(job: Job): Promise<void> {
    const user = await this.userService.getOrCreate(job.data);
    if (!user) return;

    const creator = await this.creatorService.getCreator(user, _.get(job.data, 'system.cmd.context.creator'));
    const level = await this.subscriptionLevelDbRepository.findByUuid(_.get(job.data, 'system.cmd.context.level'));
    await this.subscriptionLevelDbRepository.update({ ...level, deletedAt: null });
    await this.subscriptionLevelService.updateCreatorMaxLevel(creator);

    const keyboard = [
      [{ text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, 'subscription_level_fetch_all', { creator: creator.uuid }) }],
    ];

    await this.telegramService.botCreator.editMessageText('Subscription plan was successfully restored', {
      chat_id: user.userTgId,
      message_id: _.get(job.data, 'message.message_id'),
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }
}
