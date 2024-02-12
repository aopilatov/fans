import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EventService } from './event.service';
import { EventProcessor } from './event.processor';
import { TelegramModule } from '@/microservice/telegram';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'event' }),
    forwardRef(() => TelegramModule),
  ],
  providers: [EventService, EventProcessor],
  exports: [EventService],
})
export class EventModule {}
