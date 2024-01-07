import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaService } from './media.service';
import { MediaDbModel } from '@/db/model';
import { MediaDbRepository } from '@/db/repository';

@Module({
  imports: [TypeOrmModule.forFeature([MediaDbModel])],
  providers: [MediaService, MediaDbRepository],
  exports: [MediaService],
})
export class MediaModule {}
