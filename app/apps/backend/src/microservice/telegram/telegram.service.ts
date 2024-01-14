import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserDbModel } from '@/db/model';
import * as TelegramBot from 'node-telegram-bot-api';
import * as crypto from 'node:crypto';
import * as _ from 'lodash';

@Injectable()
export class TelegramService {
  public readonly botMain!: TelegramBot;
  public readonly botCreator!: TelegramBot;
  public readonly botAgency!: TelegramBot;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly configService: ConfigService,
  ) {
    try {
      this.botMain = new TelegramBot(this.configService.get<string>('telegram.botMain'), { polling: false });
      console.log(`Bot main successfully initiated: ${this.configService.get<string>('telegram.botMain')}`);

      this.botCreator = new TelegramBot(this.configService.get<string>('telegram.botCreator'), { polling: false });
      console.log(`Bot creator successfully initiated: ${this.configService.get<string>('telegram.botCreator')}`);

      this.botAgency = new TelegramBot(this.configService.get<string>('telegram.botAgency'), { polling: false });
      console.log(`Bot creator successfully initiated: ${this.configService.get<string>('telegram.botAgency')}`);
    } catch (e: any) {
      console.error(e);
    }
  }

  public async registerCallback(user: UserDbModel, name: string, context?: Record<string, any>): Promise<string> {
    let data = await this.cacheService.get<Record<string, any>>(`callbacks.${user.userTgId}`);
    if (!data) data = {};

    const uuid = crypto.randomUUID();
    data[uuid] = { name, context };

    await this.cacheService.set(`callbacks.${user.userTgId}`, data, 3600000);
    return uuid;
  }

  public async getCallback(tgUserId: number, uuid: string): Promise<Record<string, any>> {
    let data = await this.cacheService.get<Record<string, any>>(`callbacks.${tgUserId}`);
    return _.get(data, uuid);
  }

  public async flushCallbacks(tgUserId: number): Promise<void> {
    await this.cacheService.del(`callbacks.${tgUserId}`);
  }
}
