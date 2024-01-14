import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgencyAdminDbModel, AgencyDbModel, UserDbModel } from '../model';

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

  public async findByUserUuid(user: UserDbModel): Promise<AgencyAdminDbModel[]> {
    return this.getBaseQuery()
      .andWhere('agencyAdmin.userUuid = :userUuid', { userUuid: user.uuid })
      .getMany();
  }

  public async isAdmin(agency: AgencyDbModel, user: UserDbModel): Promise<boolean> {
    return 1 === (
      await this.getBaseQuery()
        .andWhere('agencyAdmin.agencyUuid = :agencyUuid', { agencyUuid: agency.uuid })
        .andWhere('agencyAdmin.userUuid = :userUuid', { userUuid: user.uuid })
        .getCount()
    );
  }

  public async create(agency: AgencyDbModel, user: UserDbModel): Promise<AgencyAdminDbModel> {
    const agencyAdmin = this.repository.create({ agencyUuid: agency.uuid, userUuid: user.uuid });
    return this.repository.save(agencyAdmin);
  }
}
