import { forwardRef, Inject } from '@nestjs/common';
import { OnQueueActive, OnQueueError, OnQueueStalled, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { jwtDecode } from 'jwt-decode';
import { CreatorDbModel, MEDIA_TYPE, MediaDbModel, PostDbModel, UserDbModel } from '@/db/model';
import { TelegramService } from '@/microservice/telegram';
import { UserService } from '@/microservice/user';
import { CreatorService } from '@/microservice/creator';
import { MediaService } from '@/microservice/media';
import { SubscriptionService } from '@/microservice/subscription';
import { SubscriptionLevelService } from '@/microservice/subscriptionLevel';
import { LikeService } from '@/microservice/like';
import { EventService } from '@/microservice/event';
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
    @Inject(forwardRef(() => SubscriptionService)) private readonly subscriptionService: SubscriptionService,
    @Inject(forwardRef(() => SubscriptionLevelService)) private readonly subscriptionLevelService: SubscriptionLevelService,
    @Inject(forwardRef(() => LikeService)) private readonly likeService: LikeService,
    @Inject(forwardRef(() => EventService)) private readonly eventService: EventService,
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

  private async getPostObjects(posts: PostDbModel[], creator?: CreatorDbModel, user?: UserDbModel): Promise<Record<string, any>[]> {
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
      const postMedia = mediaUuids ? await this.mediaService.getByUuids(mediaUuids) : [];

      const creatorsUuids: string[] = [];
      for (const post of posts) {
        if (post.creatorUuid !== creator?.uuid) creatorsUuids.push(post.creatorUuid);
      }

      const postCreators = creator ? [creator] : await this.creatorService.getByUuids(creatorsUuids);
      const postLikes = user ? await this.likeService.getByPostsAndUser(posts, user) : [];

      const subscriptionLevels = user ? await this.subscriptionLevelService.getByCreators(postCreators) : null;
      const subscriptions = user ? await this.subscriptionService.getListForUserAndCreators(user, postCreators) : null;

      for (const post of posts) {
        const postCreator = postCreators.find(item => item.uuid === post.creatorUuid);
        const subscription = subscriptions && subscriptions.find(item => item.creatorUuid === postCreator.uuid);
        const levels = subscriptions && subscriptionLevels.filter(item => item.creatorUuid === postCreator.uuid);

        const postMedias = postMedia.filter(item => post?.mediaUuids?.includes(item.uuid));
        const enoughSubscription = subscription && levels.find(item => item.uuid === subscription.subscriptionLevelUuid).level >= post.level;

        data.push({
          uuid: post.uuid,
          date: DateTime.fromJSDate(post.createdAt).toISO(),
          type: post.type,
          level: post.level,
          isLiked: postLikes.filter(like => like.postUuid === post.uuid).length === 1,
          creator: {
            login: postCreator.login,
            name: postCreator.name,
            isVerified: postCreator.isVerified,
            image: postMedia.find(item => item.uuid === postCreator.image),
            artwork: postMedia.find(item => item.uuid === postCreator.artwork),
            infoShort: postCreator.infoShort,
            infoLong: postCreator.infoLong,
            maxLevel: postCreator.maxLevel,
          },
          content: {
            text: post?.text,
            image: postMedias.filter(item => item.type === MEDIA_TYPE.IMAGE).map(item => creator || enoughSubscription ? item : _.omit(item, ['origin', 'none200'])),
            video: postMedias.filter(item => item.type === MEDIA_TYPE.VIDEO).map(item => creator || enoughSubscription ? item : _.omit(item, ['origin', 'none200'])),
          },
          subscription: !user ? null : {
            isSubscribed: !!subscription,
            isNotificationTurnedOn: subscription?.isNotificationed || false,
            level: levels.find(item => item.uuid === subscription?.subscriptionLevelUuid)?.level,
            prices: levels.map(item => _.pick(item, ['level', 'price'])),
          },
        });
      }
    }

    return data;
  }

  @Process('listForUser')
  public async listForUser(job: Job): Promise<Record<string, any>[]> {
    try {
      const encodedToken = _.get(job, 'data.token', '');
      const decodedToken = jwtDecode<any>(encodedToken);
      if (!decodedToken?.sub) return;

      const user = await this.userService.getByUuid(decodedToken.sub);
      if (!user) return;

      const creatorLogin = _.get(job, 'data.creator');
      if (!creatorLogin) return;

      const creator = await this.creatorService.getByLogin(creatorLogin);
      if (!creator) return;

      const posts = await this.postService.listByCreator(creator);
      return this.getPostObjects(posts, creator, user);
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('getOneForUser')
  public async getOneForUser(job: Job): Promise<Record<string, any>> {
    try {
      const encodedToken = _.get(job, 'data.token', '');
      const decodedToken = jwtDecode<any>(encodedToken);
      if (!decodedToken?.sub) return;
      const user = await this.userService.getByUuid(decodedToken.sub);
      if (!user) return;

      const creatorLogin = _.get(job, 'data.creator');
      if (!creatorLogin) return;

      const creator = await this.creatorService.getByLogin(creatorLogin);
      if (!creator) return;

      const post = await this.postService.getByCreator(creator, _.get(job, 'data.uuid'));
      if (!post) return;

      const arr = await this.getPostObjects([post], undefined, user);
      return arr[0];
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('listPhotosForUser')
  public async listPhotosForUser(job: Job): Promise<Record<string, any>> {
    try {
      const encodedToken = _.get(job, 'data.token', '');
      const decodedToken = jwtDecode<any>(encodedToken);
      if (!decodedToken?.sub) return;

      const user = await this.userService.getByUuid(decodedToken.sub);
      if (!user) return;

      const creatorLogin = _.get(job, 'data.creator');
      if (!creatorLogin) return;

      const creator = await this.creatorService.getByLogin(creatorLogin);
      if (!creator) return;

      const subscription = await this.subscriptionService.getOne(user, creator);
      const subscriptionLevels = await this.subscriptionLevelService.getByCreator(creator);
      const subscriptionLevel = subscription ? subscriptionLevels.find(item => item.uuid === subscription?.subscriptionLevelUuid) : null;

      const mediaRaw = await this.mediaService.getByCreator(creator, MEDIA_TYPE.IMAGE);
      const media = mediaRaw
        .map(item => {
          if (subscriptionLevel?.level >= item['post_level']) {
            return item;
          }

          return _.omit(item, ['origin', 'none_200'])
        })
        .map(this.mediaService.convertObjectToModel);

      for (const index in media) {
        const objRaw = mediaRaw.find(itemRaw => itemRaw.uuid === media[index].uuid);
        media[index]['postUuid'] = objRaw['post_uuid'];
      }

      return media;
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('listVideosForUser')
  public async listVideosForUser(job: Job): Promise<Record<string, any>> {
    try {
      const encodedToken = _.get(job, 'data.token', '');
      const decodedToken = jwtDecode<any>(encodedToken);
      if (!decodedToken?.sub) return;

      const user = await this.userService.getByUuid(decodedToken.sub);
      if (!user) return;

      const creatorLogin = _.get(job, 'data.creator');
      if (!creatorLogin) return;

      const creator = await this.creatorService.getByLogin(creatorLogin);
      if (!creator) return;

      const subscription = await this.subscriptionService.getOne(user, creator);
      const subscriptionLevels = await this.subscriptionLevelService.getByCreator(creator);
      const subscriptionLevel = subscription ? subscriptionLevels.find(item => item.uuid === subscription?.subscriptionLevelUuid) : null;

      const mediaRaw = await this.mediaService.getByCreator(creator, MEDIA_TYPE.VIDEO);
      const media = mediaRaw
        .map(item => {
          if (subscriptionLevel?.level >= item['post_level']) {
            return item;
          }

          return _.omit(item, ['origin', 'none_200'])
        })
        .map(this.mediaService.convertObjectToModel);

      for (const index in media) {
        const objRaw = mediaRaw.find(itemRaw => itemRaw.uuid === media[index].uuid);
        media[index]['postUuid'] = objRaw['post_uuid'];
      }

      return media;
    } catch (e: unknown) {
      console.log(e);
    }
  }

  @Process('listForCreator')
  public async listForCreator(job: Job): Promise<Record<string, any>[]> {
    try {
      const encodedToken = _.get(job, 'data.token', '');
      const decodedToken = jwtDecode<any>(encodedToken);
      if (!decodedToken?.creator) return;

      const creator = await this.creatorService.getByUuid(decodedToken.creator);
      if (!creator) return;

      const posts = await this.postService.listByCreator(creator);
      return this.getPostObjects(posts, creator);
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

      const post = await this.postService.getByCreator(creator, inputUuid);
      if (!post) return;

      const arr = await this.getPostObjects([post], creator);
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
        media = await this.mediaService.getByUuids(mediaUuids);
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

    const post = await this.postService.getByCreator(creator, inputUuid);
    if (!post) return;

    let media: MediaDbModel[];
    if (inputImages?.length || inputVideos?.length) {
      const mediaUuids = [ ...(inputImages), ...(inputVideos) ];
      media = await this.mediaService.getByUuids(mediaUuids);
    }

    return this.postService.edit(post, inputLevel, inputText, media);
  }

  @Process('export')
  public async export(job: Job): Promise<Record<string, any>> {
    try {
      const encodedToken = _.get(job, 'data.token', '');
      const decodedToken = jwtDecode<any>(encodedToken);
      if (!decodedToken?.sub) return;

      const user = await this.userService.getByUuid(decodedToken.sub);
      if (!user) return;

      const creatorLogin = _.get(job, 'data.creator');
      if (!creatorLogin) return;

      const creator = await this.creatorService.getByLogin(creatorLogin);
      if (!creator) return;

      const post = await this.postService.getByCreator(creator, _.get(job, 'data.uuid'));
      if (!post) return;

      const [postObj] = await this.getPostObjects([post], undefined, user);
      await this.eventService.postExport(user, postObj);
    } catch (e: unknown) {
      console.log(e);
    }
  }
}
