import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';

import config from '@/config';

import {
  UserDbModel,
  AgencyDbModel,
  AgencyAdminDbModel,
  AgencyInviteDbModel,
  CreatorDbModel,
  MediaDbModel,
  SubscriptionDbModel,
  SubscriptionLevelDbModel,
  PostDbModel,
} from '@/db/model';

import { TelegramModule } from '@/microservice/telegram';
import { UserModule } from '@/microservice/user';
import { CreatorModule } from '@/microservice/creator';
import { SubscriptionLevelModule } from '@/microservice/subscriptionLevel';
import { AgencyModule } from '@/microservice/agency';
import { PostModule } from '@/microservice/post';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [config],
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: true,
          timeout: 60000,
        },
      }),
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        synchronize: false,
        host: configService.get<string>('db.host'),
        port: configService.get<number>('db.port'),
        username: configService.get<string>('db.user'),
        password: configService.get<string>('db.pass'),
        database: configService.get<string>('db.name'),
        autoLoadEntities: true,
        entities: [
          UserDbModel,
          AgencyDbModel,
          AgencyAdminDbModel,
          AgencyInviteDbModel,
          CreatorDbModel,
          MediaDbModel,
          SubscriptionDbModel,
          SubscriptionLevelDbModel,
          PostDbModel
        ],
      }),
    }),

    TelegramModule,
    UserModule,
    CreatorModule,
    SubscriptionLevelModule,
    AgencyModule,
    PostModule,
  ],
})
export class AppModule {}
