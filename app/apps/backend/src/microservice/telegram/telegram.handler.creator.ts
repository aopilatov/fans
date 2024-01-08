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

  @TelegramCallbackQuery('subscription_level_create')
  public async profileSubscriptionLevelNew(data: Record<string, any>): Promise<void> {
    await this.subscriptionLevelQueue.add('level_create', data);
  }

}
