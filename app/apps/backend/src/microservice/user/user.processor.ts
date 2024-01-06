import { Process, Processor } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { TelegramService } from '@/microservice/telegram';
import { UserDbRepository } from '@/db/repository';
import { UserDbModel } from '@/db/model';
import { AuthService } from '@/microservice/auth';
import * as crypto from 'node:crypto';
import * as _ from 'lodash';

@Processor('user')
export class UserProcessor {
  constructor(
    private readonly configService: ConfigService,
    private readonly telegramService: TelegramService,
    private readonly authService: AuthService,
    private readonly userDbRepository: UserDbRepository,
  ) {}

  @Process('auth')
  public async getToken(job: Job<any>): Promise<string> {
    const userUuid = _.get(job, 'data.uuid');
    const userTgToken = _.get(job, 'data.check');
    if (!userUuid || !userTgToken) {
      return null;
    }

    const user = await this.userDbRepository.findByUuidAndTgToken(job.data.uuid, job.data.check);
    if (!user) {
      return null;
    }

    return this.authService.tokenForUser(user);
  }

  @Process('get_user')
  public async getOrCreate(job: Job<any>): Promise<UserDbModel> {
    const userTgId = parseInt(_.get(job, 'data.from.id', ''));
    let user = await this.userDbRepository.findByUserTgId(userTgId);
    if (!user) {
      const login = _.get(job, 'data.chat.username', '');
      user = await this.userDbRepository.create(userTgId, login, crypto.randomBytes(64).toString('hex'));
    }

    return user;
  }

  @Process('get_link')
  public async getLink(job: Job<any>): Promise<void> {
    try {
      const user = await this.getOrCreate(job);
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
}
