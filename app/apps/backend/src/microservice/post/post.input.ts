import { TelegramInput } from '@/common/telegram';
import { Inject, forwardRef } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TelegramService } from '@/microservice/telegram';
import { CreatorService } from '@/microservice/creator';
import { PostService } from './post.service';

export abstract class PostInput extends TelegramInput {
  protected cacheName = 'post';

  constructor(
    @Inject(CACHE_MANAGER) protected cacheService: Cache,
    @Inject(forwardRef(() => CreatorService)) protected creatorService: CreatorService,
    protected telegramService: TelegramService,
    protected postService: PostService,
  ) {
    super(telegramService.botCreator);
  }
}
