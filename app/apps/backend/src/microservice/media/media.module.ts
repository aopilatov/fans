import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaDbModel } from '@/db/model';
import { MediaDbRepository } from '@/db/repository';

@Module({
  imports: [TypeOrmModule.forFeature([MediaDbModel])],
  providers: [MediaService, MediaDbRepository],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}
