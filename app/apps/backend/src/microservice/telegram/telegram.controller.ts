import { Controller, Inject, Post, Req, forwardRef } from '@nestjs/common';
import { TelegramHandlerManager } from '@/common/telegram';
import { TelegramHandlerMain } from './telegram.handler.main';
import { TelegramHandlerCreator } from './telegram.handler.creator';
import { TelegramService } from './telegram.service';
import { FastifyRequest } from 'fastify';
import { UserService } from '@/microservice/user';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as _ from 'lodash';

@Controller('/webhook')
export class TelegramController {
  private readonly handler!: typeof TelegramHandlerManager;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    private readonly telegramService: TelegramService,
    private readonly telegramMainHandler: TelegramHandlerMain,
    private readonly telegramHandlerCreator: TelegramHandlerCreator,
  ) {
    this.handler = TelegramHandlerManager;
    this.handler.setCacheService(this.cacheService);
    this.handler.setTelegramService(this.telegramService);
  }

  @Post('/main')
  public async main(@Req() req: FastifyRequest): Promise<string> {
    this.handler.setUserService(this.userService);
    const result = await this.handler.getInstance('main').handle(req);
    if (result) {
      const [cb, data] = result;
      await _.invoke(this.telegramMainHandler, cb, data);
    }

    return 'webhook';
  }

  @Post('/creator')
  public async creator(@Req() req: FastifyRequest): Promise<string> {
    this.handler.setUserService(this.userService);
    const result = await this.handler.getInstance('creator').handle(req);
    if (result) {
      const [cb, data] = result;
      await _.invoke(this.telegramHandlerCreator, cb, data);
    }

    return 'webhook';
  }
}
