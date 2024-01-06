import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService {
  public readonly botMain!: TelegramBot;
  public readonly botCreator!: TelegramBot;

  constructor(
    private readonly configService: ConfigService,
  ) {
    try {
      this.botMain = new TelegramBot(this.configService.get<string>('telegram.botMain'), { polling: false });
      console.log(`Bot main successfully initiated: ${this.configService.get<string>('telegram.botMain')}`);

      this.botCreator = new TelegramBot(this.configService.get<string>('telegram.botCreator'), { polling: false });
      console.log(`Bot creator successfully initiated: ${this.configService.get<string>('telegram.botCreator')}`);
    } catch (e: any) {
      console.error(e);
    }
  }
}
