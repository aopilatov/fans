import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDbModel } from '../model';

@Injectable()
export class UserDbRepository {
  constructor(
    @InjectRepository(UserDbModel)
    private readonly repository: Repository<UserDbModel>,
  ) {}

  private getBaseQuery() {
    return this.repository
      .createQueryBuilder('user');
  }

  public async findByUuid(uuid: string): Promise<UserDbModel> {
    return this.getBaseQuery()
      .andWhere('user.uuid = :uuid', { uuid })
      .getOne();
  }

  public async findByUuidAndTgToken(uuid: string, tgToken: string): Promise<UserDbModel> {
    return this.getBaseQuery()
      .andWhere('user.uuid = :uuid', { uuid })
      .andWhere('user.tgToken = :tgToken', { tgToken })
      .getOne();
  }

  public async findByUserTgId(userTgId: number): Promise<UserDbModel> {
    return this.getBaseQuery()
      .andWhere('user.userTgId = :userTgId', { userTgId })
      .getOne();
  }

  public async create(userTgId: number, login: string, tgToken: string): Promise<UserDbModel> {
    const user = this.repository.create({ userTgId, login, tgToken });
    return this.repository.save(user);
  }
}
