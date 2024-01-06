import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaDbModel, MEDIA_TYPE } from '../model';

@Injectable()
export class MediaDbRepository {
  constructor(
    @InjectRepository(MediaDbModel)
    private readonly repository: Repository<MediaDbModel>,
  ) {}

  private getBaseQuery() {
    return this.repository
      .createQueryBuilder('user');
  }

  public async findByUuid(uuid: string): Promise<MediaDbModel> {
    return this.getBaseQuery()
      .andWhere('user.uuid = :uuid', { uuid })
      .getOne();
  }

  public async findByMediaUuid(mediaUuid: string): Promise<MediaDbModel> {
    return this.getBaseQuery()
      .andWhere('user.mediaUuid = :mediaUuid', { mediaUuid })
      .getOne();
  }

  public async create(mediaUuid: string, type: MEDIA_TYPE, width: number, height: number, file: string): Promise<MediaDbModel> {
    const user = this.repository.create({ mediaUuid, type, width, height, file });
    return this.repository.save(user);
  }
}
