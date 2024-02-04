import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubscriptionDbRepository } from '@/db/repository';
import { CreatorDbModel, SubscriptionDbModel, SubscriptionLevelDbModel, UserDbModel } from '@/db/model';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly configService: ConfigService,
    private readonly subscriptionDbRepository: SubscriptionDbRepository,
  ) {}

  public async getCountForUser(user: UserDbModel): Promise<number> {
    return this.subscriptionDbRepository.getCountForUser(user);
  }

  public async getListForUser(user: UserDbModel): Promise<SubscriptionDbModel[]> {
    return this.subscriptionDbRepository.getListForUser(user);
  }

  public async getOne(user: UserDbModel, creator: CreatorDbModel): Promise<SubscriptionDbModel> {
    return this.subscriptionDbRepository.getOne(user, creator);
  }

  public async create(user: UserDbModel, creator: CreatorDbModel, level: SubscriptionLevelDbModel): Promise<SubscriptionDbModel> {
    return this.subscriptionDbRepository.create(user, creator, level);
  }

  public async edit(subscription: SubscriptionDbModel, level: SubscriptionLevelDbModel): Promise<SubscriptionDbModel> {
    return this.subscriptionDbRepository.edit({ ...subscription, subscriptionLevelUuid: level.uuid });
  }

  public async setNotificationed(subscription: SubscriptionDbModel, isNotificationed: boolean): Promise<SubscriptionDbModel> {
    return this.subscriptionDbRepository.edit({ ...subscription, isNotificationed });
  }

  public async remove(subscription: SubscriptionDbModel): Promise<void> {
    await this.subscriptionDbRepository.remove(subscription);
  }
}
