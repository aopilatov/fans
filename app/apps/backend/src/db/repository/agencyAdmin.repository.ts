import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgencyAdminDbModel } from '../model';

@Injectable()
export class AgencyAdminDbRepository {
  constructor(
    @InjectRepository(AgencyAdminDbModel)
    private readonly repository: Repository<AgencyAdminDbModel>,
  ) {}

  private getBaseQuery() {
    return this.repository
      .createQueryBuilder('agencyAdmin');
  }

  public async findByUuid(uuid: string): Promise<AgencyAdminDbModel> {
    return this.getBaseQuery()
      .andWhere('agencyAdmin.uuid = :uuid', { uuid })
      .getOne();
  }

  public async create(agencyUuid: string, userUuid: string): Promise<AgencyAdminDbModel> {
    const agency = this.repository.create({ agencyUuid, userUuid });
    return this.repository.save(agency);
  }
}
