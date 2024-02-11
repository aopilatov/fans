import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaDbModel, MEDIA_TYPE, CreatorDbModel } from '../model';

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

  public async findByUuids(uuids: string[]): Promise<MediaDbModel[]> {
    return this.getBaseQuery()
      .andWhere('media.uuid IN (:...uuids)', { uuids })
      .getMany();
  }

  public async findByCreator(creator: CreatorDbModel, type: MEDIA_TYPE): Promise<Record<string, any>[]> {
    return this.repository.query(`
      SELECT
          p.uuid as post_uuid,
          p.level as post_level,
          m.*
      FROM post p
          JOIN media m ON m.uuid = ANY (p.media_uuids::UUID[]) AND p.creator_uuid = '${creator.uuid}'
      WHERE m.type = '${type}'
      ORDER BY p.created_at DESC;
    `);
  }

  public async create(uuid: string, type: MEDIA_TYPE, width: number, height: number, origin: string, none200?: string, blur200?: string): Promise<MediaDbModel> {
    const media = this.repository.create({ uuid, type, width, height, origin, none200, blur200 });
    return this.repository.save(media);
  }
}
