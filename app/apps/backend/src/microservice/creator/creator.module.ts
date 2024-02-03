import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreatorProcessor } from './creator.processor';
import { CreatorService } from './creator.service';
import { CreatorController } from './creator.controller';
import { TelegramModule } from '@/microservice/telegram';
import { MediaModule } from '@/microservice/media';
import { UserModule } from '@/microservice/user';
import { AuthModule } from '@/microservice/auth';
import { AgencyAdminModule } from '@/microservice/agencyAdmin';
import { SubscriptionLevelModule } from '@/microservice/subscriptionLevel';
import { CreatorDbRepository } from '@/db/repository';
import { CreatorDbModel } from '@/db/model';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

import { CreatorInputCreate } from './creator.input.create';
import { CreatorInputChangeName } from './creator.input.changeName';
import { CreatorInputChangeLogin } from './creator.input.changeLogin';
import { CreatorInputChangeInfoShort } from './creator.input.changeInfoShort';
import { CreatorInputChangeInfoLong } from './creator.input.changeInfoLong';
import { CreatorInputChangeImage } from './creator.input.changeImage';
import { CreatorInputChangeArtwork } from './creator.input.changeArtwork';

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
    BullModule.registerQueue({ name: 'creator' }),
    TypeOrmModule.forFeature([CreatorDbModel]),
    AuthModule,
    MediaModule,
    AgencyAdminModule,
    forwardRef(() => TelegramModule),
    forwardRef(() => UserModule),
    forwardRef(() => SubscriptionLevelModule),
  ],

  providers: [
    CreatorProcessor,
    CreatorService,
    CreatorDbRepository,
    CreatorInputCreate,
    CreatorInputChangeName,
    CreatorInputChangeLogin,
    CreatorInputChangeInfoShort,
    CreatorInputChangeInfoLong,
    CreatorInputChangeImage,
    CreatorInputChangeArtwork,
  ],

  controllers: [CreatorController],
  exports: [CreatorService],
})
export class CreatorModule {}
