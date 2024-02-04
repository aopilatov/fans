import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionDbModel } from '@/db/model';
import { SubscriptionDbRepository } from '@/db/repository';
import { UserModule } from '@/microservice/user';
import { CreatorModule } from '@/microservice/creator';
import { MediaModule } from '@/microservice/media';
import { SubscriptionLevelModule } from '@/microservice/subscriptionLevel';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionProcessor } from './subscription.processor';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'subscription' }),
    TypeOrmModule.forFeature([SubscriptionDbModel]),
    forwardRef(() => UserModule),
    forwardRef(() => CreatorModule),
    forwardRef(() => SubscriptionLevelModule),
    MediaModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionProcessor, SubscriptionDbRepository],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
