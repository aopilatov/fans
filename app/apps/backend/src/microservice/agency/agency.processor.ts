import { OnQueueActive, OnQueueError, OnQueueStalled, Process, Processor } from '@nestjs/bull';
import { forwardRef, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CreatorService } from '@/microservice/creator';
import { TelegramService } from '@/microservice/telegram';
import { UserService } from '@/microservice/user';
import { Job } from 'bull';
import { AgencyDbModel, UserDbModel } from '@/db/model';
import { AgencyDbRepository } from '@/db/repository';
import * as _ from 'lodash';

@Processor('agency')
export class AgencyProcessor {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject(forwardRef(() => CreatorService)) private readonly creatorService: CreatorService,
    private readonly agencyDbRepository: AgencyDbRepository,
    private readonly telegramService: TelegramService,
    private readonly userService: UserService,
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

      const process = await this.cacheService.get<any>(`input:agency:${user.uuid}`);
      if (!process || !process?.type) return;

      switch (process.type) {
        // case 'subscription_level_create':
        //   await this.subscriptionLevelInputAdd.proceed(user, job.data, process);
        //   break;
      }

      return;
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('retrieve_creator_agency')
  public async retrieveCreatorAgency(job: Job): Promise<void> {
    const user = await this.userService.getOrCreate(job.data);
    if (!user) return;

    const creator = await this.creatorService.getCreator(user, _.get(job.data, 'system.cmd.context.creator'));
    let agency!: AgencyDbModel;

    const keyboard = [
      [{ text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, 'creator_profile_menu', { creator: creator.uuid }) }],
    ];

    let message = 'You don\'t have a producer. You could confirm producer in the inqueries';

    if (creator?.agencyUuid) {
      agency = await this.agencyDbRepository.findByUuid(creator.agencyUuid);
      keyboard.push([{
        text: agency.name,
        callback_data: await this.telegramService.registerCallback(user, 'agency_creator_retrieve', { creator: creator.uuid, agency: agency.uuid }),
      }]);

      message = `Producer: ${agency.name}`;
    } else {
      keyboard[0].push({
        text: '👋🏼 Inqueries',
        callback_data: await this.telegramService.registerCallback(user, 'agency_fetch_creator_inqueries', { creator: creator.uuid }),
      });
    }

    await this.telegramService.botCreator.editMessageText(message, {
      chat_id: user.userTgId,
      message_id: _.get(job.data, 'message.message_id'),
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  @Process('fetch_creator_inqueries')
  public async fetchCreatorInqueries(job: Job): Promise<void> {
    const user = await this.userService.getOrCreate(job.data);
    if (!user) return;


  }
}
