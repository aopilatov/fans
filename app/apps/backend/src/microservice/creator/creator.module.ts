import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreatorProcessor } from './creator.processor';
import { CreatorService } from './creator.service';
import { TelegramModule } from '@/microservice/telegram';
import { MediaModule } from '@/microservice/media';
import { SubscriptionLevelModule } from '@/microservice/subscriptionLevel';
import { CreatorDbRepository } from '@/db/repository';
import { CreatorDbModel } from '@/db/model';
import { CacheModule } from '@nestjs/cache-manager';

import { CreatorInputCreate } from './creator.input.create';
import { CreatorInputChangeName } from './creator.input.changeName';
import { CreatorInputChangeLogin } from './creator.input.changeLogin';
import { CreatorInputChangeInfoShort } from './creator.input.changeInfoShort';
import { CreatorInputChangeInfoLong } from './creator.input.changeInfoLong';
import { CreatorInputChangeImage } from './creator.input.changeImage';
import { CreatorInputChangeArtwork } from './creator.input.changeArtwork';
import { SubscriptionLevelInputAdd } from '@/microservice/subscriptionLevel/subscriptionLevel.input.add';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'user' }, { name: 'creator' }),
    TypeOrmModule.forFeature([CreatorDbModel]),
    CacheModule.register(),
    TelegramModule,
    MediaModule,
    SubscriptionLevelModule,
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
    SubscriptionLevelInputAdd,
  ],
})
export class CreatorModule {}
