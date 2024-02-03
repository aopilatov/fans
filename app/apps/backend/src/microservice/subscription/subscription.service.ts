import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubscriptionDbRepository } from '@/db/repository';
import { SubscriptionDbModel, UserDbModel } from '@/db/model';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly configService: ConfigService,
    private readonly subscriptionDbRepository: SubscriptionDbRepository,
  ) {}

  public async getCountForUser(user: UserDbModel): Promise<number> {
    return this.subscriptionDbRepository.getCountForUser(user);
  }

  public getListForUser(user: UserDbModel): Promise<SubscriptionDbModel[]> {
    return this.subscriptionDbRepository.getListForUser(user);
  }
}
