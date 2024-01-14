import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgencyInviteDbModel, AgencyDbModel, CreatorDbModel } from '../model';

@Injectable()
export class AgencyInviteDbRepository {
  constructor(
    @InjectRepository(AgencyInviteDbModel)
    private readonly repository: Repository<AgencyInviteDbModel>,
  ) {}

  private getBaseQuery() {
    return this.repository
      .createQueryBuilder('agencyInvite');
  }

  public async findByUuid(uuid: string): Promise<AgencyInviteDbModel> {
    return this.getBaseQuery()
      .andWhere('agencyInvite.uuid = :uuid', { uuid })
      .getOne();
  }

  public async findByCreator(creator: CreatorDbModel): Promise<AgencyInviteDbModel[]> {
    return this.getBaseQuery()
      .andWhere('agencyInvite.creatorUuid = :creatorUuid', { creatorUuid: creator.uuid })
      .addOrderBy('agencyInvite.createdAt', 'DESC')
      .getMany();
  }

  public async findByUuidAndCreator(uuid: string, creator: CreatorDbModel): Promise<AgencyInviteDbModel> {
    return this.getBaseQuery()
      .andWhere('agencyInvite.uuid = :uuid', { uuid })
      .andWhere('agencyInvite.creatorUuid = :creatorUuid', { creatorUuid: creator.uuid })
      .getOne();
  }

  public async isExisting(agency: AgencyDbModel, creator: CreatorDbModel): Promise<boolean> {
    return 1 === (await this.getBaseQuery()
      .andWhere('agencyInvite.agencyUuid = :agencyUuid', { agencyUuid: agency.uuid })
      .andWhere('agencyInvite.creatorUuid = :creatorUuid', { creatorUuid: creator.uuid })
      .getCount());
  }

  public async create(agency: AgencyDbModel, creator: CreatorDbModel): Promise<AgencyInviteDbModel> {
    const agencyInvite = this.repository.create({ agencyUuid: agency.uuid, creatorUuid: creator.uuid });
    return this.repository.save(agencyInvite);
  }

  public async remove(invite: AgencyInviteDbModel): Promise<void> {
    await this.repository.remove(invite);
  }
}
