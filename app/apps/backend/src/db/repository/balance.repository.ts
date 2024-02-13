import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BALANCE_CURRENCY, BalanceDbModel, UserDbModel } from '@/db/model';

@Injectable()
export class BalanceDbRepository {
  constructor(
    @InjectRepository(BalanceDbModel)
    private readonly repository: Repository<BalanceDbModel>,
  ) {}

  private getBaseQuery() {
    return this.repository
      .createQueryBuilder('balance');
  }

  public async create(user: UserDbModel, currency: BALANCE_CURRENCY, value: string = '0'): Promise<BalanceDbModel> {
    const balance = this.repository.create({ userUuid: user.uuid, currency, value });
    return this.repository.save(balance);
  }

  public async getByUser(user: UserDbModel): Promise<BalanceDbModel[]> {
    return this.getBaseQuery()
      .andWhere('balance.userUuid = :userUuid', { userUuid: user.uuid })
      .getMany();
  }
}
