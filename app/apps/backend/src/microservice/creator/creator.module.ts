import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreatorProcessor } from './creator.processor';
import { CreatorService } from './creator.service';
import { TelegramModule } from '@/microservice/telegram';
import { CreatorDbRepository } from '@/db/repository';
import { CreatorDbModel } from '@/db/model';
import { CacheModule } from '@nestjs/cache-manager';
import { CreatorInputCreate } from './creator.input.create';
import { CreatorInputChangeName } from './creator.input.changeName';
import { CreatorInputChangeLogin } from './creator.input.changeLogin';
import { CreatorInputChangeInfoShort } from './creator.input.changeInfoShort';
import { CreatorInputChangeInfoLong } from './creator.input.changeInfoLong';
import { CreatorInputChangeImage } from './creator.input.changeImage';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'user' }, { name: 'creator' }),
    TypeOrmModule.forFeature([CreatorDbModel]),
    CacheModule.register(),
    TelegramModule,
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
  ],
})
export class CreatorModule {}
