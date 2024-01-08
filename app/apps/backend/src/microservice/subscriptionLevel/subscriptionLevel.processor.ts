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
import * as _ from 'lodash';

import { SubscriptionLevelInputAdd } from './subscriptionLevel.input.add';

@Processor('subscriptionLevel')
export class SubscriptionLevelProcessor {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject(forwardRef(() => CreatorService)) private readonly creatorService: CreatorService,
    private readonly telegramService: TelegramService,
    private readonly subscriptionLevelService: SubscriptionLevelService,
    private readonly userService: UserService,

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
    if (userTgId) await this.telegramService.flushCallbacks(userTgId);
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
  public async getProfileSubscriptionLevels(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      const creator = await this.creatorService.getCreator(user, _.get(job.data, 'system.cmd.context.creator'));
      const levels = await this.subscriptionLevelService.getForCreator(creator);
      levels.sort((a,b) => a.price - b.price);

      const data = [];
      for (const item of levels) {
        data.push([{
          text: item.price ? `${item.level}) ${item.price} USDT` : `${item.level}) Free`,
          callback_data: await this.telegramService.registerCallback(user, 'subscription_level_fetch_all',  { level: item.uuid }),
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

  @Process('level_create')
  private async addProfileSubscriptionLevel(job: Job): Promise<void> {
    try {
      const user = await this.userService.getOrCreate(job.data);
      if (!user) return;

      await this.subscriptionLevelInputAdd.proceed(user, job.data);
    } catch (e: unknown) {
      console.log(e);
    }
  }
}
