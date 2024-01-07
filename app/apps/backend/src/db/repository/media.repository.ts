import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaDbModel, MEDIA_TYPE, MEDIA_TRANSFORMATION } from '../model';

@Injectable()
export class MediaDbRepository {
  constructor(
    @InjectRepository(MediaDbModel)
    private readonly repository: Repository<MediaDbModel>,
  ) {}

  private getBaseQuery() {
    return this.repository
      .createQueryBuilder('media');
  }

  public async findByUuid(uuid: string): Promise<MediaDbModel> {
    return this.getBaseQuery()
      .andWhere('media.uuid = :uuid', { uuid })
      .getOne();
  }

  public async findByMediaUuid(mediaUuid: string): Promise<MediaDbModel> {
    return this.getBaseQuery()
      .andWhere('media.mediaUuid = :mediaUuid', { mediaUuid })
      .getOne();
  }

  public async create(mediaUuid: string, type: MEDIA_TYPE, transformation: MEDIA_TRANSFORMATION, width: number, height: number, file: string): Promise<MediaDbModel> {
    const user = this.repository.create({ mediaUuid, type, transformation, width, height, file });
    return this.repository.save(user);
  }
}
