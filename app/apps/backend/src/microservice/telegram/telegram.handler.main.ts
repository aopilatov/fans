import { Injectable } from '@nestjs/common';
import { TelegramHandler, TelegramCommand } from '@/common/telegram';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
@TelegramHandler('main')
export class TelegramHandlerMain {
  constructor(
    @InjectQueue('user') private readonly userQueue: Queue,
  ) {}

  @TelegramCommand('/start')
  public async start(data: Record<string, any>): Promise<void> {
    await this.userQueue.add('get_link', data);
  }

}
