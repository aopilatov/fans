import { Injectable } from '@nestjs/common';
import { SubscriptionLevelDbRepository } from '@/db/repository';
import { CreatorDbModel, SubscriptionLevelDbModel, UserDbModel } from '@/db/model';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class SubscriptionLevelService {
  constructor(
    private readonly subscriptionLevelDbRepository: SubscriptionLevelDbRepository,
  ) {}

  public async getForCreator(creator: CreatorDbModel): Promise<SubscriptionLevelDbModel[]> {
    return this.subscriptionLevelDbRepository.findByCreator(creator);
  }

  public async create(creator: CreatorDbModel, price: number): Promise<SubscriptionLevelDbModel> {
    const levels = await this.subscriptionLevelDbRepository.findByCreator(creator);
    let level = 1;

    if (levels.find(item => item.price === price)) {
      throw new Error('Subscription price is already exist');
    }

    levels.sort((a,b) => a.price - b.price);

    let levelsWithMorePrice = levels.filter(item => item.price > price);
    if (levelsWithMorePrice) {
      levelsWithMorePrice = levelsWithMorePrice.map(item => {
        item.level = item.level + 1;
        return item;
      });

      await Promise.all(levelsWithMorePrice.map(item => this.subscriptionLevelDbRepository.update(item)));
    }

    level = levels.filter(item => item.price < price).length + 1;
    return this.subscriptionLevelDbRepository.create(creator, level, price);
  }
}
