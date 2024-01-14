import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { SubscriptionLevelDbRepository } from '@/db/repository';
import { CreatorDbModel, SubscriptionLevelDbModel, UserDbModel } from '@/db/model';
import { CreatorService } from '@/microservice/creator';

@Injectable()
export class SubscriptionLevelService {
  constructor(
    private readonly subscriptionLevelDbRepository: SubscriptionLevelDbRepository,
    @Inject(forwardRef(() => CreatorService)) private readonly creatorService: CreatorService,
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
    const newLevel = await this.subscriptionLevelDbRepository.create(creator, level, price);

    await this.updateCreatorMaxLevel(creator);
    return newLevel;
  }

  public async updateCreatorMaxLevel(creator: CreatorDbModel): Promise<void> {
    const maxLevel = await this.subscriptionLevelDbRepository.findMaxByCreator(creator);
    await this.creatorService.updateMaxLevel(creator, maxLevel.level);
  }
}
