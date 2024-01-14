import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgencyDbModel } from '../model';

@Injectable()
export class AgencyDbRepository {
  constructor(
    @InjectRepository(AgencyDbModel)
    private readonly repository: Repository<AgencyDbModel>,
  ) {}

  private getBaseQuery() {
    return this.repository
      .createQueryBuilder('agency');
  }

  public async findByUuid(uuid: string): Promise<AgencyDbModel> {
    return this.getBaseQuery()
      .andWhere('agency.uuid = :uuid', { uuid })
      .getOne();
  }

  public async findByUuids(uuids: string[]): Promise<AgencyDbModel[]> {
    return this.getBaseQuery()
      .andWhere('agency.uuid IN (:...uuids)', { uuids })
      .getMany();
  }

  public async create(name: string): Promise<AgencyDbModel> {
    const agency = this.repository.create({ name });
    return this.repository.save(agency);
  }

  public async edit(agency: AgencyDbModel): Promise<AgencyDbModel> {
    return this.repository.save(agency);
  }
}
