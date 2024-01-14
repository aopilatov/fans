import { forwardRef, Inject } from '@nestjs/common';
import { Process, Processor, OnQueueStalled, OnQueueError, OnQueueActive } from '@nestjs/bull';
import { Job } from 'bull';
import { TelegramService } from '@/microservice/telegram';
import { UserService } from '@/microservice/user';
import { CreatorService } from '@/microservice/creator';
import { PostService } from './post.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Processor('post')
export class PostProcessor {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject(forwardRef(() => CreatorService)) private readonly creatorService: CreatorService,
    private readonly telegramService: TelegramService,
    private readonly userService: UserService,
    private readonly postService: PostService,
  ) {}
}
