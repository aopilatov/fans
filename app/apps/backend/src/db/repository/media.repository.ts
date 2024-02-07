import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaDbModel, MEDIA_TYPE, MEDIA_TRANSFORMATION, CreatorDbModel } from '../model';

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

  public async findByMediaUuid(mediaUuid: string): Promise<MediaDbModel[]> {
    return this.getBaseQuery()
      .andWhere('media.mediaUuid = :mediaUuid', { mediaUuid })
      .getMany();
  }

  public async findByMediaUuids(mediaUuids: string[]): Promise<MediaDbModel[]> {
    return this.getBaseQuery()
      .andWhere('media.mediaUuid IN (:...mediaUuids)', { mediaUuids })
      .getMany();
  }

  public async findByCreator(creator: CreatorDbModel, type: MEDIA_TYPE): Promise<Record<string, any>[]> {
    return this.repository.query(`
      SELECT
          p.uuid as post_uuid,
          p.level as post_level,
          m.*
      FROM post p
          JOIN media m ON m.media_uuid = ANY (p.media_uuids::UUID[]) AND p.creator_uuid = '${creator.uuid}'
      WHERE m.type = '${type}';
    `);
  }

  public async create(mediaUuid: string, type: MEDIA_TYPE, transformation: MEDIA_TRANSFORMATION, width: number, height: number, file: string): Promise<MediaDbModel> {
    const user = this.repository.create({ mediaUuid, type, transformation, width, height, file });
    return this.repository.save(user);
  }
}
