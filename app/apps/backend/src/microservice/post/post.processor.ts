import { forwardRef, Inject } from '@nestjs/common';
import { OnQueueActive, OnQueueError, OnQueueStalled, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { jwtDecode } from 'jwt-decode';
import { CreatorDbModel, MEDIA_TYPE, MediaDbModel, PostDbModel, UserDbModel } from '@/db/model';
import { TelegramService } from '@/microservice/telegram';
import { UserService } from '@/microservice/user';
import { CreatorService } from '@/microservice/creator';
import { MediaService } from '@/microservice/media';
import { PostService } from './post.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import * as _ from 'lodash';

import { PostInputCreate } from './post.input.create';

@Processor('post')
export class PostProcessor {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject(forwardRef(() => CreatorService)) private readonly creatorService: CreatorService,
    private readonly configService: ConfigService,
    private readonly telegramService: TelegramService,
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly mediaService: MediaService,

    private readonly postInputCreate: PostInputCreate,
  ) {}

  @OnQueueStalled()
  @OnQueueError()
  public async OnQueueError(job: Job): Promise<void> {
    try {
      console.error('stalled', job.id);
      await job.remove();
    } catch (e: unknown) {
      console.error(e);
    }
  }

  @OnQueueActive()
  public async onProgress(job: Job): Promise<void> {
    const userTgId = parseInt(_.get(job, 'data.from.id', ''));
    // if (userTgId) await this.telegramService.flushCallbacks(userTgId);
  }

  @Process('process')
  public async processHandler(job: Job): Promise<void> {
    try {
      const user: UserDbModel = _.get(job.data, 'user');

      const process = await this.cacheService.get<any>(`input:post:${user.uuid}`);
      if (!process || !process?.type) return;

      switch (process.type) {
        case 'create':
          await this.postInputCreate.proceed(user, job.data, process);
          break;
      }

      return;
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('get_menu')
  public async getMenu(job: Job): Promise<void> {
    const user = await this.userService.getOrCreate(job.data);
    if (!user) return;

    const contextProfile = _.get(job, 'data.system.cmd.context.creator');
    const keyboard = [
      [{ text: '⬅️ Back', callback_data: await this.telegramService.registerCallback(user, 'creator_profile_menu', { creator: contextProfile }) }],
      [{
        text: '🌠 New post',
        web_app: {
          url: `${this.configService.get<string>('url.frontend')}/auth/${user.uuid}/${user.tgToken}/${contextProfile}/${encodeURIComponent('creator/manage/post/new')}`,
        },
      }],
      [{
        text: '📚 Manage posts',
        web_app: {
          url: `${this.configService.get<string>('url.frontend')}/auth/${user.uuid}/${user.tgToken}/${contextProfile}/${encodeURIComponent('creator/manage/post')}`,
        },
      }],
    ];

    await this.telegramService.botCreator.editMessageText('Manage posts', {
      chat_id: user.userTgId,
      message_id: _.get(job.data, 'message.message_id'),
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  private async getPostObjects(posts: PostDbModel[], creator?: CreatorDbModel, skipSubscription?: boolean): Promise<Record<string, any>[]> {
    const data = [];

    if (posts?.length) {
      const mediaUuids: string[] = [];
      if (creator) {
        if (creator?.image) mediaUuids.push(creator.image);
        if (creator?.artwork) mediaUuids.push(creator.artwork);
      }
      for (const post of posts) {
        mediaUuids.push(...(post.mediaUuids || []));
      }
      const postMedia= mediaUuids ? await this.mediaService.getByMediaUuids(mediaUuids) : [];

      const creatorsUuids: string[] = [];
      for (const post of posts) {
        if (post.creatorUuid !== creator?.uuid) creatorsUuids.push(post.creatorUuid);
      }
      const postCreators = creator ? [creator] : await this.creatorService.getByUuids(creatorsUuids);

      for (const post of posts) {
        const postCreator = postCreators.find(item => item.uuid === post.creatorUuid);
        const postMedias = post?.mediaUuids?.map(item => postMedia.filter(media => media.mediaUuid === item));
        const postImages = [];
        const postVideos = [];
        for (const item of postMedias) {
          const firstEl: MediaDbModel = _.get(item, '[0]');
          if (firstEl) {
            if (firstEl.type === MEDIA_TYPE.IMAGE) postImages.push(item.filter(i => i.transformation === 'none').map(i => _.pick(i, ['width', 'height', 'file', creator && 'mediaUuid'])));
            if (firstEl.type === MEDIA_TYPE.VIDEO) postVideos.push(item.filter(i => i.transformation === 'none').map(i => _.pick(i, ['width', 'height', 'file', creator && 'mediaUuid'])));
          }
        }

        data.push({
          uuid: post.uuid,
          date: DateTime.fromJSDate(post.createdAt).toISO(),
          type: post.type,
          level: post.level,
          creator: {
            login: postCreator.login,
            name: postCreator.name,
            isVerified: postCreator.isVerified,
            image: postCreator?.image && postMedia.find(item => item.mediaUuid === postCreator.image),
            artwork: postCreator?.artwork && postMedia.find(item => item.mediaUuid === postCreator.artwork),
            infoShort: postCreator.infoShort,
            infoLong: postCreator.infoLong,
            maxLevel: postCreator.maxLevel,
          },
          content: {
            text: post?.text,
            image: postImages,
            video: postVideos,
          },
          subscription: skipSubscription ? null : {
            // todo
          },
        });
      }
    }

    return data;
  }

  @Process('listForCreator')
  public async listForCreator(job: Job): Promise<Record<string, any>[]> {
    try {
      const encodedToken = _.get(job, 'data.token', '');
      const decodedToken = jwtDecode<any>(encodedToken);
      if (!decodedToken?.creator) return;

      const creator = await this.creatorService.getByUuid(decodedToken.creator);
      if (!creator) return;

      const posts = await this.postService.listForCreator(creator);
      return this.getPostObjects(posts, creator, true);
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('getForCreator')
  public async getForCreator(job: Job): Promise<Record<string, any>> {
    try {
      const inputUuid = _.get(job, 'data.uuid');
      if (!inputUuid) {
        return;
      }

      const encodedToken = _.get(job, 'data.token', '');
      const decodedToken = jwtDecode<any>(encodedToken);
      if (!decodedToken?.creator) return;

      const creator = await this.creatorService.getByUuid(decodedToken.creator);
      if (!creator) return;

      const post = await this.postService.getForCreator(creator, inputUuid);
      if (!post) return;

      const arr = await this.getPostObjects([post], creator, true);
      return arr[0];
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('create')
  public async create(job: Job): Promise<PostDbModel> {
    try {
      const inputLevel = _.get(job, 'data.level');
      const inputText = _.get(job, 'data.text', null);
      const inputImages = _.get(job, 'data.images', []);
      const inputVideos = _.get(job, 'data.videos', []);

      if (!inputText && !inputImages?.length && !inputVideos?.length) {
        return;
      }

      const encodedToken = _.get(job, 'data.token', '');
      const decodedToken = jwtDecode<any>(encodedToken);
      if (!decodedToken?.creator) return;

      const creator = await this.creatorService.getByUuid(decodedToken.creator);
      if (!creator) return;

      let media: MediaDbModel[];
      if (inputImages?.length || inputVideos?.length) {
        const mediaUuids = [ ...(inputImages), ...(inputVideos) ];
        media = await this.mediaService.getByMediaUuids(mediaUuids);
      }

      return this.postService.create(creator, inputLevel, inputText, media);
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('edit')
  public async edit(job: Job): Promise<PostDbModel> {
    const inputUuid = _.get(job, 'data.uuid');
    const inputLevel = _.get(job, 'data.level');
    const inputText = _.get(job, 'data.text', null);
    const inputImages = _.get(job, 'data.images', []);
    const inputVideos = _.get(job, 'data.videos', []);

    if (!inputText && !inputImages?.length && !inputVideos?.length) {
      return;
    }

    const encodedToken = _.get(job, 'data.token', '');
    const decodedToken = jwtDecode<any>(encodedToken);
    if (!decodedToken?.creator) return;

    const creator = await this.creatorService.getByUuid(decodedToken.creator);
    if (!creator) return;

    const post = await this.postService.getForCreator(creator, inputUuid);
    if (!post) return;

    let media: MediaDbModel[];
    if (inputImages?.length || inputVideos?.length) {
      const mediaUuids = [ ...(inputImages), ...(inputVideos) ];
      media = await this.mediaService.getByMediaUuids(mediaUuids);
    }

    return this.postService.edit(post, inputLevel, inputText, media);
  }
}
