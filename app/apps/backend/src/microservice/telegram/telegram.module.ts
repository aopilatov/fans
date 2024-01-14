import { Module, forwardRef } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramInit } from './telegram.init';
import { TelegramController } from './telegram.controller';
import { TelegramHandlerMain } from './telegram.handler.main';
import { TelegramHandlerCreator } from './telegram.handler.creator';
import { TelegramHandlerAgency } from './telegram.handler.agency';
import { UserModule } from '@/microservice/user';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        isGlobal: true,
        store: redisStore,
        url: `redis://${configService.get<string>('redis.host')}:${configService.get<number>('redis.port')}`,
      }),
    }),

    BullModule.registerQueue(
      { name: 'user' },
      { name: 'creator' },
      { name: 'subscriptionLevel' },
      { name: 'agency' },
      { name: 'post' },
    ),
    forwardRef(() => UserModule),
  ],

  providers: [
    TelegramService,
    TelegramInit,
    TelegramHandlerMain,
    TelegramHandlerCreator,
    TelegramHandlerAgency,
  ],

  controllers: [TelegramController],
  exports: [TelegramService],
})
export class TelegramModule {}
