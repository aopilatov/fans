import { TelegramInput } from '@/common/telegram';
import { Inject, forwardRef } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TelegramService } from '@/microservice/telegram';
import { CreatorService } from '@/microservice/creator';
import { SubscriptionLevelService } from './subscriptionLevel.service';

export abstract class SubscriptionLevelInput extends TelegramInput {
  protected cacheName = 'subscription_level';

  constructor(
    @Inject(CACHE_MANAGER) protected cacheService: Cache,
    @Inject(forwardRef(() => CreatorService)) protected creatorService: CreatorService,
    @Inject(forwardRef(() => TelegramService)) protected telegramService: TelegramService,
    protected subscriptionLevelService: SubscriptionLevelService,
  ) {
    super(telegramService.botCreator);
  }
}
