import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BalanceDbRepository } from '@/db/repository';
import { BALANCE_CURRENCY, BalanceDbModel, UserDbModel } from '@/db/model';

@Injectable()
export class BalanceService {
  constructor(
    private readonly configService: ConfigService,
    private readonly balanceDbRepository: BalanceDbRepository,
  ) {}

  public async create(user: UserDbModel, currency: BALANCE_CURRENCY): Promise<BalanceDbModel> {
    return this.balanceDbRepository.create(user, currency);
  }

  public async getByUser(user: UserDbModel): Promise<BalanceDbModel[]> {
    return this.balanceDbRepository.getByUser(user);
  }
}
