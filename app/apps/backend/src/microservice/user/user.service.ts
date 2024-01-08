import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserDbModel } from '@/db/model';
import { UserDbRepository } from '@/db/repository';
import { TelegramService } from '@/microservice/telegram';
import { ConfigService } from '@nestjs/config';
import crypto from 'node:crypto';
import * as _ from 'lodash';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => TelegramService)) private readonly telegramService: TelegramService,
    private readonly configService: ConfigService,
    private readonly userDbRepository: UserDbRepository,
  ) {}

  public async getLink(data: Record<string, any>): Promise<void> {
    try {
      const user = await this.getOrCreate(data);
      await this.telegramService.botMain.sendMessage(user.userTgId, `Hey, ${user.login}! Click on the button bellow to start!`, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Open app',
                web_app: {
                  url: `${this.configService.get<string>('url.frontend')}/auth/${user.uuid}/${user.tgToken}`,
                },
              },
            ]
          ],
        },
      });
    } catch (e: unknown) {
      console.error(e);
    }
  }

  public async getOrCreate(data: Record<string, any>): Promise<UserDbModel> {
    const userTgId = parseInt(_.get(data, 'from.id', ''));
    let user = await this.userDbRepository.findByUserTgId(userTgId);
    if (!user) {
      const login = _.get(data, 'chat.username', '');
      user = await this.userDbRepository.create(userTgId, login, crypto.randomBytes(64).toString('hex'));
    }

    return user;
  }
}
