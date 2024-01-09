import { Injectable } from '@nestjs/common';
import { TelegramHandler, TelegramCommand, TelegramCallbackQuery, TelegramProcess } from '@/common/telegram';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
@TelegramHandler('creator')
export class TelegramHandlerCreator {
  constructor(
    @InjectQueue('creator') private readonly creatorQueue: Queue,
    @InjectQueue('subscriptionLevel') private readonly subscriptionLevelQueue: Queue,
    @InjectQueue('agency') private readonly agencyQueue: Queue,
  ) {}

  @TelegramCommand('/start')
  @TelegramCallbackQuery('start_back')
  public async start(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('get_menu', data);
  }

  @TelegramProcess('creator')
  public async processHandlerCreator(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('process', data);
  }

  @TelegramProcess('subscription_level')
  public async processHandlerSubscriptionLevel(data: Record<string, any>): Promise<void> {
    await this.subscriptionLevelQueue.add('process', data);
  }

  @TelegramProcess('agency')
  public async processHandlerAgency(data: Record<string, any>): Promise<void> {
    await this.agencyQueue.add('process', data);
  }

  @TelegramCallbackQuery('creator_profile_fetch_all')
  public async list(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('profile_fetch_all', data);
  }

  @TelegramCallbackQuery('creator_profile_create')
  public async create(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('profile_create', data);
  }

  @TelegramCallbackQuery('creator_profile_menu')
  public async profileMenu(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('profile_menu', data);
  }

  @TelegramCallbackQuery('creator_profile_edit_name')
  public async profileEditName(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('profile_edit_name', data);
  }

  @TelegramCallbackQuery('creator_profile_edit_login')
  public async profileEditLogin(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('profile_edit_login', data);
  }

  @TelegramCallbackQuery('creator_profile_edit_info_short')
  public async profileEditInfoShort(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('profile_edit_info_short', data);
  }

  @TelegramCallbackQuery('creator_profile_edit_info_long')
  public async profileEditInfoLong(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('profile_edit_info_long', data);
  }

  @TelegramCallbackQuery('creator_profile_edit_image')
  public async profileEditImage(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('profile_edit_image', data);
  }

  @TelegramCallbackQuery('creator_profile_edit_artwork')
  public async profileEditArtwork(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('profile_edit_artwork', data);
  }

  @TelegramCallbackQuery('subscription_level_fetch_all')
  public async profileSubscriptionLevels(data: Record<string, any>): Promise<void> {
    await this.subscriptionLevelQueue.add('level_fetch_all', data);
  }

  @TelegramCallbackQuery('subscription_level_retrieve')
  public async profileSubscriptionLevel(data: Record<string, any>): Promise<void> {
    await this.subscriptionLevelQueue.add('level_retrieve', data);
  }

  @TelegramCallbackQuery('subscription_level_create')
  public async profileSubscriptionLevelNew(data: Record<string, any>): Promise<void> {
    await this.subscriptionLevelQueue.add('level_create', data);
  }

  @TelegramCallbackQuery('subscription_level_archive')
  public async profileSubscriptionLevelArchive(data: Record<string, any>): Promise<void> {
    await this.subscriptionLevelQueue.add('level_archive', data);
  }

  @TelegramCallbackQuery('subscription_level_unarchive')
  public async profileSubscriptionLevelUnarchive(data: Record<string, any>): Promise<void> {
    await this.subscriptionLevelQueue.add('level_unarchive', data);
  }

  @TelegramCallbackQuery('agency_retrieve_creator_agency')
  public async profileAgency(data: Record<string, any>): Promise<void> {
    await this.agencyQueue.add('retrieve_creator_agency', data);
  }

  @TelegramCallbackQuery('agency_fetch_creator_inqueries')
  public async profileAgencyInqueries(data: Record<string, any>): Promise<void> {
    await this.agencyQueue.add('fetch_creator_inqueries', data);
  }

}
