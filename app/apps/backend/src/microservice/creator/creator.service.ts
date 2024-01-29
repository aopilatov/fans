import { Injectable } from '@nestjs/common';
import { AgencyDbModel, CreatorDbModel, UserDbModel } from '@/db/model';
import { CreatorDbRepository } from '@/db/repository';

@Injectable()
export class CreatorService {
  constructor(
    private readonly creatorDbRepository: CreatorDbRepository,
  ) {}

  public async getByUuid(uuid: string): Promise<CreatorDbModel> {
    return this.creatorDbRepository.findByUuid(uuid);
  }

  public async getByUuids(uuids: string[]): Promise<CreatorDbModel[]> {
    return this.creatorDbRepository.findByUuids(uuids);
  }

  public async getCreator(user: UserDbModel, uuid: string): Promise<CreatorDbModel> {
    return this.creatorDbRepository.findByUserAndUuid(user, uuid);
  }

  public async getByAgency(agency: AgencyDbModel): Promise<CreatorDbModel[]> {
    return this.creatorDbRepository.findByAgency(agency);
  }

  public async getByLogin(login: string): Promise<CreatorDbModel> {
    return this.creatorDbRepository.findByLogin(login);
  }

  public async updateMaxLevel(creator: CreatorDbModel, level: number): Promise<CreatorDbModel> {
    return this.creatorDbRepository.update({ ...creator, maxLevel: level });
  }

  public async updateAgency(creator: CreatorDbModel, agency: AgencyDbModel | null): Promise<CreatorDbModel> {
    return this.creatorDbRepository.update({ ...creator, agencyUuid: agency?.uuid || null });
  }
}
