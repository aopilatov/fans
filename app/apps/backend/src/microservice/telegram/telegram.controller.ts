import { Controller, Inject, Post, Req } from '@nestjs/common';
import { TelegramHandlerManager } from '@/common/telegram';
import { TelegramHandlerMain } from './telegram.handler.main';
import { TelegramHandlerCreator } from './telegram.handler.creator';
import { TelegramService } from './telegram.service';
import { FastifyRequest } from 'fastify';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as _ from 'lodash';

@Controller('/webhook')
export class TelegramController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly telegramService: TelegramService,
    private readonly telegramMainHandler: TelegramHandlerMain,
    private readonly telegramHandlerCreator: TelegramHandlerCreator,
  ) {}

  @Post('/main')
  public async main(@Req() req: FastifyRequest): Promise<string> {
    const result = await TelegramHandlerManager.getInstance('main', this.cacheService, this.telegramService).handle(req);
    if (result) {
      const [cb, data] = result;
      await _.invoke(this.telegramMainHandler, cb, data);
    }

    return 'webhook';
  }

  @Post('/creator')
  public async creator(@Req() req: FastifyRequest): Promise<string> {
    const result = await TelegramHandlerManager.getInstance('creator', this.cacheService, this.telegramService).handle(req);
    if (result) {
      const [cb, data] = result;
      await _.invoke(this.telegramHandlerCreator, cb, data);
    }

    return 'webhook';
  }
}
