import { forwardRef, Inject } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { UserService } from '@/microservice/user';
import { PostService } from '@/microservice/post';
import { LikeService } from './like.service';
import { jwtDecode } from 'jwt-decode';
import * as _ from 'lodash';

@Processor('like')
export class LikeProcessor {
  constructor(
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    @Inject(forwardRef(() => PostService)) private readonly postService: PostService,
    private readonly likeService: LikeService,
  ) {}

  @Process('set')
  public async set(job: Job): Promise<Record<string, any>> {
    const encodedToken = _.get(job, 'data.token', '');
    const decodedToken = jwtDecode<any>(encodedToken);
    if (!decodedToken?.sub) return;

    const user = await this.userService.getByUuid(decodedToken?.sub);
    if (!user) return;

    const post = await this.postService.getByUuid(_.get(job, 'data.uuid', ''));
    if (!post) return;

    const like = await this.likeService.set(post, user);
    return {
      postUuid: post.uuid,
      isLiked: !!like,
    };
  }
}
