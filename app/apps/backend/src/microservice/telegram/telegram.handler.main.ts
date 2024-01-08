import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { TelegramHandler, TelegramCommand } from '@/common/telegram';
import { UserService } from '@/microservice/user';

@Injectable()
@TelegramHandler('main')
export class TelegramHandlerMain {
  constructor(
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
  ) {}

  @TelegramCommand('/start')
  public async start(data: Record<string, any>): Promise<void> {
    await this.userService.getLink(data);
  }

}
