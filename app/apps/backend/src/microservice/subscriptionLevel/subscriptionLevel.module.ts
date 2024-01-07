import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionLevelService } from './subscriptionLevel.service';
import { SubscriptionLevelDbModel } from '@/db/model';
import { SubscriptionLevelDbRepository } from '@/db/repository';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionLevelDbModel])],
  providers: [SubscriptionLevelService, SubscriptionLevelDbRepository],
  exports: [SubscriptionLevelService],
})
export class SubscriptionLevelModule {}
