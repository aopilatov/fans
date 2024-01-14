import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { TelegramHandler, TelegramCommand, TelegramCallbackQuery, TelegramProcess } from '@/common/telegram';
import { UserService } from '@/microservice/user';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
@TelegramHandler('agency')
export class TelegramHandlerAgency {
  constructor(
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    @InjectQueue('agency') private readonly agencyQueue: Queue,
  ) {}

  @TelegramProcess('agency')
  public async processHandlerAgency(data: Record<string, any>): Promise<void> {
    await this.agencyQueue.add('process', data);
  }

  @TelegramCommand('/start')
  @TelegramCallbackQuery('start_back')
  public async start(data: Record<string, any>): Promise<void> {
    await this.agencyQueue.add('get_menu', data);
  }

  @TelegramCallbackQuery('agency_create')
  public async create(data: Record<string, any>): Promise<void> {
    await this.agencyQueue.add('create', data);
  }

  @TelegramCallbackQuery('agency_profiles')
  public async list(data: Record<string, any>): Promise<void> {
    await this.agencyQueue.add('profiles', data);
  }

  @TelegramCallbackQuery('agency_profile_menu')
  public async profile(data: Record<string, any>): Promise<void> {
    await this.agencyQueue.add('profile_menu', data);
  }

  @TelegramCallbackQuery('agency_profile_edit_name')
  public async editName(data: Record<string, any>): Promise<void> {
    await this.agencyQueue.add('profile_edit_name', data);
  }

  @TelegramCallbackQuery('agency_creator_invite')
  public async inviteCreator(data: Record<string, any>): Promise<void> {
    await this.agencyQueue.add('creator_invite', data);
  }

  @TelegramCallbackQuery('agency_creators_fetch')
  public async fetchCreators(data: Record<string, any>): Promise<void> {
    await this.agencyQueue.add('creators_fetch', data);
  }

}
