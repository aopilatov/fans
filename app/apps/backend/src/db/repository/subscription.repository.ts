import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatorDbModel, SubscriptionDbModel, SubscriptionLevelDbModel, UserDbModel } from '@/db/model';

@Injectable()
export class SubscriptionDbRepository {
  constructor(
    @InjectRepository(SubscriptionDbModel)
    private readonly repository: Repository<SubscriptionDbModel>,
  ) {}

  private getBaseQuery() {
    return this.repository
      .createQueryBuilder('subscription');
  }

  public async getOne(user: UserDbModel, creator: CreatorDbModel): Promise<SubscriptionDbModel> {
    return this.getBaseQuery()
      .andWhere('subscription.userUuid = :userUuid', { userUuid: user.uuid })
      .andWhere('subscription.creatorUuid = :creatorUuid', { creatorUuid: creator.uuid })
      .getOne();
  }

  public async getListForUser(user: UserDbModel): Promise<SubscriptionDbModel[]> {
    return this.getBaseQuery()
      .andWhere('subscription.userUuid = :userUuid', { userUuid: user.uuid })
      .addOrderBy('subscription.createdAt', 'DESC')
      .getMany();
  }

  public async getCountForUser(user: UserDbModel): Promise<number> {
    return this.getBaseQuery()
      .andWhere('subscription.userUuid = :userUuid', { userUuid: user.uuid })
      .getCount();
  }

  public async create(user: UserDbModel, creator: CreatorDbModel, subscriptionLevel: SubscriptionLevelDbModel): Promise<SubscriptionDbModel> {
    const subscription = this.repository.create({
      userUuid: user.uuid,
      creatorUuid: creator.uuid,
      subscriptionLevelUuid: subscriptionLevel.uuid,
    });

    return this.repository.save(subscription);
  }

  public async edit(subscription: SubscriptionDbModel): Promise<SubscriptionDbModel> {
    return this.repository.save(subscription);
  }

  public async remove(subscription: SubscriptionDbModel): Promise<void> {
    await this.repository.remove(subscription);
  }
}
