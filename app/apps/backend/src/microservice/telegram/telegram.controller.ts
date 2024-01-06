import { Controller, Post, Req } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { TelegramHandlerManager } from '@/common/telegram';
import { TelegramHandlerMain } from './telegram.handler.main';
import { TelegramHandlerCreator } from './telegram.handler.creator';
import { Queue } from 'bull';
import { FastifyRequest } from 'fastify';
import * as _ from 'lodash';

@Controller('/webhook')
export class TelegramController {
  constructor(
    @InjectQueue('user') private readonly userQueue: Queue,
    @InjectQueue('creator') private readonly creatorQueue: Queue,
    private readonly telegramMainHandler: TelegramHandlerMain,
    private readonly telegramHandlerCreator: TelegramHandlerCreator,
  ) {}

  @Post('/main')
  public async main(@Req() req: FastifyRequest): Promise<string> {
    const [cb, data] = await TelegramHandlerManager.getInstance('main').handle(req);
    await _.invoke(this.telegramMainHandler, cb, data);

    return 'webhook';
  }

  @Post('/creator')
  public async creator(@Req() req: FastifyRequest): Promise<string> {
    const [cb, data] = await TelegramHandlerManager.getInstance('creator').handle(req);
    await _.invoke(this.telegramHandlerCreator, cb, data);

    return 'webhook';
  }
}
