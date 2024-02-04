import { Injectable } from '@nestjs/common';
import { PostDbRepository } from '@/db/repository';
import { CreatorDbModel, MEDIA_TYPE, MediaDbModel, POST_TYPE, PostDbModel } from '@/db/model';
import * as _ from 'lodash';

@Injectable()
export class PostService {
  constructor(
    private readonly postDbRepository: PostDbRepository,
  ) {}

  public async listByCreator(creator: CreatorDbModel): Promise<PostDbModel[]> {
    return this.postDbRepository.getListByCreator(creator);
  }

  public async getByCreator(creator: CreatorDbModel, uuid: string): Promise<PostDbModel> {
    return this.postDbRepository.getOneByCreator(creator, uuid);
  }

  public async create(creator: CreatorDbModel, level: number, text?: string, media?: MediaDbModel[]): Promise<PostDbModel> {
    let type = POST_TYPE.TEXT;
    if ((media || []).filter(item => item.type === MEDIA_TYPE.IMAGE).length > 0) type = POST_TYPE.IMAGE;
    if ((media || []).filter(item => item.type === MEDIA_TYPE.VIDEO).length > 0) type = POST_TYPE.VIDEO;

    return this.postDbRepository.create(creator, type, level, text, media);
  }

  public async edit(post: PostDbModel, level: number, text?: string, media?: MediaDbModel[]): Promise<PostDbModel> {
    let type = POST_TYPE.TEXT;
    if ((media || []).filter(item => item.type === MEDIA_TYPE.IMAGE).length > 0) type = POST_TYPE.IMAGE;
    if ((media || []).filter(item => item.type === MEDIA_TYPE.VIDEO).length > 0) type = POST_TYPE.VIDEO;

    post.type = type;
    post.level = level;
    post.text = text;
    post.mediaUuids = _.uniq((media || []).map(item => item.mediaUuid));

    return this.postDbRepository.edit(post);
  }
}
