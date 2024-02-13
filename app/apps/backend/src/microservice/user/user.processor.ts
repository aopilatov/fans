import { forwardRef, Inject } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { UserDbRepository } from '@/db/repository';
import { AuthService } from '@/microservice/auth';
import { SubscriptionService } from '@/microservice/subscription';
import { BalanceService } from '@/microservice/balance';
import { UserService } from './user.service';
import { jwtDecode } from 'jwt-decode';
import * as _ from 'lodash';

@Processor('user')
export class UserProcessor {
  constructor(
    @Inject(forwardRef(() => SubscriptionService)) private readonly subscriptionService: SubscriptionService,
    @Inject(forwardRef(() => BalanceService)) private readonly balanceService: BalanceService,
    private readonly authService: AuthService,
    private readonly userDbRepository: UserDbRepository,
    private readonly userService: UserService,
  ) {}

  @Process('auth')
  public async getToken(job: Job): Promise<string> {
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

  @Process('self')
  public async getSelf(job: Job): Promise<Record<string, any>> {
    const encodedToken = _.get(job, 'data.token', '');
    const decodedToken = jwtDecode<any>(encodedToken);
    if (!decodedToken?.sub) return;

    const user = await this.userService.getByUuid(decodedToken?.sub);
    if (!user) return;

    const balances = await this.balanceService.getByUser(user);

    return {
      subscriptions: {
        count: await this.subscriptionService.getCountForUser(user),
      },
      balances: balances.map(item => ({
        amount: item.value,
        currency: item.currency.toUpperCase(),
      })),
    };
  }
}
