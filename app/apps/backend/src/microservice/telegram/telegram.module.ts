import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramInit } from './telegram.init';
import { TelegramController } from './telegram.controller';
import { TelegramHandlerMain } from './telegram.handler.main';
import { TelegramHandlerCreator } from './telegram.handler.creator';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'user' },
      { name: 'creator' }
    ),
  ],

  providers: [
    TelegramService,
    TelegramInit,
    TelegramHandlerMain,
    TelegramHandlerCreator,
  ],

  controllers: [TelegramController],
  exports: [TelegramService],
})
export class TelegramModule {}
