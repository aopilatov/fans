import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeDbModel } from '@/db/model';
import { LikeDbRepository } from '@/db/repository';
import { LikeController } from './like.controller';
import { LikeProcessor } from './like.processor';
import { LikeService } from './like.service';
import { UserModule } from '@/microservice/user';
import { PostModule } from '@/microservice/post';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'like' }),
    TypeOrmModule.forFeature([LikeDbModel]),
    forwardRef(() => UserModule),
    forwardRef(() => PostModule),
  ],
  controllers: [LikeController],
  providers: [LikeService, LikeProcessor, LikeDbRepository],
  exports: [LikeService],
})
export class LikeModule {}
