import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatorDbModel, UserDbModel } from '../model';

@Injectable()
export class CreatorDbRepository {
  constructor(
    @InjectRepository(CreatorDbModel)
    private readonly repository: Repository<CreatorDbModel>,
  ) {}

  private getBaseQuery() {
    return this.repository
      .createQueryBuilder('creator');
  }

  public async findByUuid(uuid: string): Promise<CreatorDbModel> {
    return this.getBaseQuery()
      .andWhere('creator.uuid = :uuid', { uuid })
      .getOne();
  }

  public async findByUser(user: UserDbModel): Promise<CreatorDbModel[]> {
    return this.getBaseQuery()
      .andWhere('creator.userUuid = :userUuid', { userUuid: user.uuid })
      .getMany();
  }

  public async findByUserAndUuid(user: UserDbModel, uuid: string): Promise<CreatorDbModel> {
    return this.getBaseQuery()
      .andWhere('creator.userUuid = :userUuid', { userUuid: user.uuid })
      .andWhere('creator.uuid = :uuid', { uuid })
      .getOne();
  }

  public async findByLogin(login: string): Promise<CreatorDbModel> {
    return this.getBaseQuery()
      .andWhere('creator.login = :login', { login })
      .getOne();
  }

  public async findByUserAndLogin(user: UserDbModel, login: string): Promise<CreatorDbModel> {
    return this.getBaseQuery()
      .andWhere('creator.userUuid = :userUuid', { userUuid: user.uuid })
      .andWhere('creator.login = :login', { login: login.toLowerCase() })
      .getOne();
  }

  public async create(user: UserDbModel, login: string, name: string, infoShort: string, infoLong?: string, image?: string, artwork?: string): Promise<CreatorDbModel> {
    const creator = this.repository.create({ userUuid: user.uuid, login, name, infoShort, infoLong, image, artwork });
    return this.repository.save(creator);
  }

  public async update(creator: CreatorDbModel): Promise<CreatorDbModel> {
    return this.repository.save(creator);
  }
}
