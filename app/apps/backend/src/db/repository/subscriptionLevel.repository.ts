import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatorDbModel, SubscriptionLevelDbModel } from '../model';

@Injectable()
export class SubscriptionLevelDbRepository {
  constructor(
    @InjectRepository(SubscriptionLevelDbModel)
    private readonly repository: Repository<SubscriptionLevelDbModel>,
  ) {}

  private getBaseQuery() {
    return this.repository
      .createQueryBuilder('subscriptionLevel');
  }

  public async findByUuid(uuid: string): Promise<SubscriptionLevelDbModel> {
    return this.getBaseQuery()
      .andWhere('subscriptionLevel.uuid = :uuid', { uuid })
      .getOne();
  }

  public async findByCreator(creator: CreatorDbModel): Promise<SubscriptionLevelDbModel[]> {
    return this.getBaseQuery()
      .andWhere('subscriptionLevel.creatorUuid = :creatorUuid', { creatorUuid: creator.uuid })
      .getMany();
  }

  public async create(creator: CreatorDbModel, level: number, price: number ): Promise<SubscriptionLevelDbModel> {
    const subscriptionLevel = this.repository.create({ creatorUuid: creator.uuid, level, price });
    return this.repository.save(subscriptionLevel);
  }

  public async update(subscriptionLevel: SubscriptionLevelDbModel): Promise<SubscriptionLevelDbModel> {
    return this.repository.save(subscriptionLevel);
  }
}
