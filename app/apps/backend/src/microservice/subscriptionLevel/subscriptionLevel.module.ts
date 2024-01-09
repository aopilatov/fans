import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionLevelProcessor } from './subscriptionLevel.processor';
import { SubscriptionLevelService } from './subscriptionLevel.service';
import { SubscriptionLevelDbModel } from '@/db/model';
import { SubscriptionLevelDbRepository } from '@/db/repository';
import { BullModule } from '@nestjs/bull';
import { TelegramModule } from '@/microservice/telegram';
import { CreatorModule } from '@/microservice/creator';
import { UserModule } from '@/microservice/user';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

import { SubscriptionLevelInputAdd } from './subscriptionLevel.input.add';

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
    BullModule.registerQueue({ name: 'subscriptionLevel' }),
    TypeOrmModule.forFeature([SubscriptionLevelDbModel]),
    TelegramModule,
    UserModule,
    forwardRef(() => CreatorModule),
  ],

  providers: [
    SubscriptionLevelService,
    SubscriptionLevelProcessor,
    SubscriptionLevelDbRepository,
    SubscriptionLevelInputAdd,
  ],

  exports: [SubscriptionLevelService],
})
export class SubscriptionLevelModule {}
