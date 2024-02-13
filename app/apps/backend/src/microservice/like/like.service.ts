import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LikeDbRepository } from '@/db/repository';
import { LikeDbModel, PostDbModel, UserDbModel } from '@/db/model';

@Injectable()
export class LikeService {
  constructor(
    private readonly configService: ConfigService,
    private readonly likeDbRepository: LikeDbRepository,
  ) {}

  public async getCountByPost(post: PostDbModel): Promise<number> {
    return this.likeDbRepository.getCountByPost(post);
  }

  public async getByPostAndUser(post: PostDbModel, user: UserDbModel): Promise<LikeDbModel> {
    return this.likeDbRepository.getByPostAndUser(post, user);
  }

  public async getByPostsAndUser(posts: PostDbModel[], user: UserDbModel): Promise<LikeDbModel[]> {
    return this.likeDbRepository.getByPostsAndUser(posts, user);
  }

  public async set(post: PostDbModel, user: UserDbModel): Promise<LikeDbModel | null> {
    const like = await this.getByPostAndUser(post, user);
    if (like) {
      await this.likeDbRepository.remove(like);
      return null;
    }

    return this.likeDbRepository.create(post, user);
  }
}
