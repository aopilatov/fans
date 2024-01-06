import { Injectable } from '@nestjs/common';
import { TelegramHandler, TelegramCommand, TelegramCallbackQuery, TelegramProcess } from '@/common/telegram';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
@TelegramHandler('creator')
export class TelegramHandlerCreator {
  constructor(
    @InjectQueue('creator') private readonly creatorQueue: Queue,
  ) {}

  @TelegramCommand('/start')
  @TelegramCallbackQuery('start_back')
  public async start(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('get_menu', data);
  }

  @TelegramProcess()
  public async processHandler(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('process', data);
  }

  @TelegramCallbackQuery('profile_all')
  public async list(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('get_profiles', data);
  }

  @TelegramCallbackQuery('profile_create')
  public async create(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('create_profile', data);
  }

  @TelegramCallbackQuery('profile_actions_')
  public async profileMenu(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('menu_profile', data);
  }

  @TelegramCallbackQuery('profile_edit_name_')
  public async profileEditName(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('edit_profile_name', data);
  }

  @TelegramCallbackQuery('profile_edit_login_')
  public async profileEditLogin(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('edit_profile_login', data);
  }

  @TelegramCallbackQuery('profile_edit_info_short_')
  public async profileEditInfoShort(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('edit_profile_info_short', data);
  }

  @TelegramCallbackQuery('profile_edit_info_long_')
  public async profileEditInfoLong(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('edit_profile_info_long', data);
  }

  @TelegramCallbackQuery('profile_edit_image_')
  public async profileEditImage(data: Record<string, any>): Promise<void> {
    await this.creatorQueue.add('edit_profile_image', data);
  }

}
