import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyDbModel } from '@/db/model';
import { AgencyDbRepository } from '@/db/repository';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { TelegramModule } from '@/microservice/telegram';
import { UserModule } from '@/microservice/user';
import { CreatorModule } from '@/microservice/creator';
import { AgencyAdminModule } from '@/microservice/agencyAdmin';
import { AgencyInviteModule } from '@/microservice/agencyInvite';
import { AgencyProcessor } from './agency.processor';
import { AgencyService } from './agency.service';

import { AgencyInputCreate } from './agency.input.create';
import { AgencyInputEditName } from './agency.input.editName';
import { AgencyInputInvite } from './agency.input.invite';

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
    BullModule.registerQueue({ name: 'agency' }),
    TypeOrmModule.forFeature([AgencyDbModel]),
    TelegramModule,
    UserModule,
    AgencyAdminModule,
    AgencyInviteModule,
    forwardRef(() => CreatorModule),
  ],

  providers: [
    AgencyProcessor,
    AgencyService,
    AgencyDbRepository,

    AgencyInputCreate,
    AgencyInputEditName,
    AgencyInputInvite,
  ],

  exports: [AgencyService],
})
export class AgencyModule {}
