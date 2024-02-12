import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikeDbModel, PostDbModel, UserDbModel } from '@/db/model';

@Injectable()
export class LikeDbRepository {
  constructor(
    @InjectRepository(LikeDbModel)
    private readonly repository: Repository<LikeDbModel>,
  ) {}

  private getBaseQuery() {
    return this.repository
      .createQueryBuilder('like');
  }

  public async getByPostAndUser(post: PostDbModel, user: UserDbModel): Promise<LikeDbModel> {
    return this.getBaseQuery()
      .andWhere('like.postUuid = :postUuid', { postUuid: post.uuid })
      .andWhere('like.userUuid = :userUuid', { userUuid: user.uuid })
      .getOne();
  }

  public async getByPostsAndUser(posts: PostDbModel[], user: UserDbModel): Promise<LikeDbModel[]> {
    return this.getBaseQuery()
      .andWhere('like.postUuid IN (:...postUuids)', { postUuids: posts.map(item => item.uuid) })
      .andWhere('like.userUuid = :userUuid', { userUuid: user.uuid })
      .getMany();
  }

  public async create(post: PostDbModel, user: UserDbModel): Promise<LikeDbModel> {
    const like = this.repository.create({ postUuid: post.uuid, userUuid: user.uuid });
    return this.repository.save(like);
  }

  public async remove(like: LikeDbModel): Promise<void> {
    await this.repository.remove(like);
  }
}
