import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaDbRepository } from '@/db/repository';

@Module({
  providers: [MediaService, MediaDbRepository],
  exports: [MediaService],
})
export class MediaModule {}
