import { TelegramInput } from '@/common/telegram';
import { forwardRef, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TelegramService } from '@/microservice/telegram';
import { AgencyService } from './agency.service';
import { CreatorService } from '@/microservice/creator';

export abstract class AgencyInput extends TelegramInput {
  protected cacheName = 'agency';

  constructor(
    @Inject(CACHE_MANAGER) protected cacheService: Cache,
    @Inject(forwardRef(() => CreatorService)) protected readonly creatorService: CreatorService,
    protected telegramService: TelegramService,
    protected readonly agencyService: AgencyService,
  ) {
    super(telegramService.botAgency);
  }
}
