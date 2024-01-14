import { Injectable, OnModuleInit } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramInit implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly telegramService: TelegramService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.telegramService.botMain.deleteWebHook();
    await this.telegramService.botMain.setWebHook(`${this.configService.get<string>('url.backend')}/webhook/main`);
    console.log(`Initiated main: ${this.configService.get<string>('url.backend')}/webhook/main`);

    await this.telegramService.botCreator.deleteWebHook();
    await this.telegramService.botCreator.setWebHook(`${this.configService.get<string>('url.backend')}/webhook/creator`);
    console.log(`Initiated creator: ${this.configService.get<string>('url.backend')}/webhook/creator`);

    await this.telegramService.botAgency.deleteWebHook();
    await this.telegramService.botAgency.setWebHook(`${this.configService.get<string>('url.backend')}/webhook/agency`);
    console.log(`Initiated agency: ${this.configService.get<string>('url.backend')}/webhook/agency`);
  }
}
