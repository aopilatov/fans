import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatorDbModel, MEDIA_TYPE, MediaDbModel, POST_TYPE, PostDbModel, UserDbModel } from '@/db/model';
import * as _ from 'lodash';

@Injectable()
export class PostDbRepository {
  constructor(
    @InjectRepository(PostDbModel)
    private readonly repository: Repository<PostDbModel>,
  ) {}

  private getBaseQuery() {
    return this.repository
      .createQueryBuilder('post');
  }

  public async getByUuid(uuid: string): Promise<PostDbModel> {
    return this.getBaseQuery()
      .andWhere('post.uuid = :uuid', { uuid })
      .getOne();
  }

  public async getListByCreator(creator: CreatorDbModel): Promise<PostDbModel[]> {
    return this.getBaseQuery()
      .andWhere('post.creatorUuid = :creatorUuid', { creatorUuid: creator.uuid })
      .addOrderBy('post.createdAt', 'DESC')
      .getMany();
  }

  public async getOneByCreator(creator: CreatorDbModel, uuid: string): Promise<PostDbModel> {
    return this.getBaseQuery()
      .andWhere('post.creatorUuid = :creatorUuid', { creatorUuid: creator.uuid })
      .andWhere('post.uuid = :uuid', { uuid })
      .getOne();
  }

  public async getFeed(user: UserDbModel): Promise<PostDbModel[]> {
    return this.getBaseQuery()
      .leftJoin('subscription', 'subscription', 'subscription.creator_uuid = post.creatorUuid')
      .andWhere('subscription.user_uuid = :userUuid', { userUuid: user.uuid })
      .addOrderBy('post.createdAt', 'DESC')
      .getMany();
  }

  public async create(creator: CreatorDbModel, type: POST_TYPE, level: number, text?: string, media?: MediaDbModel[]): Promise<PostDbModel> {
    const post = this.repository.create({
      creatorUuid: creator.uuid,
      mediaUuids: _.uniq((media || []).map(item => item.uuid)),
      type,
      level,
      text,
    });

    return this.repository.save(post);
  }

  public async edit(post: PostDbModel): Promise<PostDbModel> {
    return this.repository.save(post);
  }
}
