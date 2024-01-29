import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostService } from './post.service';
import { PostProcessor } from './post.processor';
import { PostController } from './post.controller';
import { PostDbModel } from '@/db/model';
import { PostDbRepository } from '@/db/repository';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { BullModule } from '@nestjs/bull';
import { TelegramModule } from '@/microservice/telegram';
import { UserModule } from '@/microservice/user';
import { CreatorModule } from '@/microservice/creator';
import { MediaModule } from '@/microservice/media';

import { PostInputCreate } from './post.input.create';

@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        isGlobal: true,
        ttl: 3600 * 1000,
        store: redisStore,
        url: `redis://${configService.get<string>('redis.host')}:${configService.get<number>('redis.port')}`,
      }),
    }),
    BullModule.registerQueue({ name: 'post' }),
    TypeOrmModule.forFeature([PostDbModel]),
    TelegramModule,
    UserModule,
    MediaModule,
    forwardRef(() => CreatorModule),
  ],

  providers: [
    PostService,
    PostProcessor,
    PostDbRepository,

    PostInputCreate,
  ],

  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
