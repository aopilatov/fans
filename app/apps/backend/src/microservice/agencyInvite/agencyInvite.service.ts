import { Injectable } from '@nestjs/common';
import { AgencyInviteDbRepository } from '@/db/repository';
import { AgencyDbModel, AgencyInviteDbModel, CreatorDbModel, UserDbModel } from '@/db/model';

@Injectable()
export class AgencyInviteService {
  constructor(
    private readonly agencyInviteDbRepository: AgencyInviteDbRepository,
  ) {}

  public async create(agency: AgencyDbModel, creator: CreatorDbModel): Promise<AgencyInviteDbModel> {
    return this.agencyInviteDbRepository.create(agency, creator);
  }

  public async getByUuidAndCreator(uuid: string, creator: CreatorDbModel): Promise<AgencyInviteDbModel> {
    return this.agencyInviteDbRepository.findByUuidAndCreator(uuid, creator);
  }

  public async getListByCreator(creator: CreatorDbModel): Promise<AgencyInviteDbModel[]> {
    return this.agencyInviteDbRepository.findByCreator(creator);
  }

  public async isExisting(agency: AgencyDbModel, creator: CreatorDbModel): Promise<boolean> {
    return this.agencyInviteDbRepository.isExisting(agency, creator);
  }

  public async remove(invite: AgencyInviteDbModel): Promise<void> {
    await this.agencyInviteDbRepository.remove(invite);
  }
}
