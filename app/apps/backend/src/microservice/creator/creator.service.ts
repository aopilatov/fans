import { Injectable } from '@nestjs/common';
import { CreatorDbModel, UserDbModel } from '@/db/model';
import { CreatorDbRepository } from '@/db/repository';

@Injectable()
export class CreatorService {
  constructor(
    private readonly creatorDbRepository: CreatorDbRepository,
  ) {}

  public async getCreator(user: UserDbModel, uuid: string): Promise<CreatorDbModel> {
    return this.creatorDbRepository.findByUserAndUuid(user, uuid);
  }

  public async updateMaxLevel(creator: CreatorDbModel, level: number): Promise<CreatorDbModel> {
    return this.creatorDbRepository.update({ ...creator, maxLevel: level });
  }
}
