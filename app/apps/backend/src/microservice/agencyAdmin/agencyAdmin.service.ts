import { Injectable } from '@nestjs/common';
import { AgencyAdminDbRepository } from '@/db/repository';
import { AgencyAdminDbModel, AgencyDbModel, UserDbModel } from '@/db/model';

@Injectable()
export class AgencyAdminService {
  constructor(
    private readonly agencyAdminDbRepository: AgencyAdminDbRepository,
  ) {}

  public async create(agency: AgencyDbModel, user: UserDbModel): Promise<AgencyAdminDbModel> {
    return this.agencyAdminDbRepository.create(agency, user);
  }

  public async getListByUser(user: UserDbModel): Promise<AgencyAdminDbModel[]> {
    return this.agencyAdminDbRepository.findByUserUuid(user);
  }

  public async isUserAdmin(agency: AgencyDbModel, user: UserDbModel): Promise<boolean> {
    return this.agencyAdminDbRepository.isAdmin(agency, user);
  }
}
