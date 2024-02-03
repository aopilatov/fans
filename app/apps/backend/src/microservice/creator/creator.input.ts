import { TelegramInput } from '@/common/telegram';
import { Inject, forwardRef } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CreatorDbRepository } from '@/db/repository';
import { TelegramService } from '@/microservice/telegram';
import { MediaService } from '@/microservice/media';
import { SubscriptionLevelService } from '@/microservice/subscriptionLevel';

export abstract class CreatorInput extends TelegramInput {
  protected cacheName = 'creator';

  constructor(
    @Inject(CACHE_MANAGER) protected cacheService: Cache,
    @Inject(forwardRef(() => SubscriptionLevelService)) protected readonly subscriptionLevelService: SubscriptionLevelService,
    @Inject(forwardRef(() => TelegramService)) protected readonly telegramService: TelegramService,
    protected readonly mediaService: MediaService,
    protected readonly creatorDbRepository: CreatorDbRepository,
  ) {
    super(telegramService.botCreator);
  }
}
