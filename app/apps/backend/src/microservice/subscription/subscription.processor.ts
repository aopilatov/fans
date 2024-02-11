import { forwardRef, Inject } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { UserService } from '@/microservice/user';
import { CreatorService } from '@/microservice/creator';
import { MediaService } from '@/microservice/media';
import { SubscriptionService } from './subscription.service';
import { jwtDecode } from 'jwt-decode';
import { MediaDbModel, SubscriptionDbModel } from '@/db/model';
import { SubscriptionLevelService } from '@/microservice/subscriptionLevel';
import * as _ from 'lodash';

@Processor('subscription')
export class SubscriptionProcessor {
  constructor(
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    @Inject(forwardRef(() => CreatorService)) private readonly creatorService: CreatorService,
    @Inject(forwardRef(() => SubscriptionLevelService)) private readonly subscriptionLevelService: SubscriptionLevelService,
    private readonly subscriptionService: SubscriptionService,
    private readonly mediaService: MediaService,
  ) {}

  @Process('listForUser')
  public async listForUser(job: Job): Promise<Record<string, any>> {
    const encodedToken = _.get(job, 'data.token', '');
    const decodedToken = jwtDecode<any>(encodedToken);
    if (!decodedToken?.sub) return;

    const user = await this.userService.getByUuid(decodedToken?.sub);
    if (!user) return;

    const subscriptions = await this.subscriptionService.getListForUser(user);
    const subscriptionsData: Record<string, any>[] = [];
    if (subscriptions?.length > 0) {
      const creators = await this.creatorService.getByUuids(subscriptions.map(item => item.creatorUuid));

      const mediaUuids: string[] = [];
      for (const creator of creators) {
        if (creator?.image) mediaUuids.push(creator.image);
        if (creator?.artwork) mediaUuids.push(creator.artwork);
      }
      let media: MediaDbModel[] = [];
      if (mediaUuids?.length) {
        media = await this.mediaService.getByUuids(mediaUuids);
      }

      for (const subscription of subscriptions) {
        const creator = creators.find(item => item.uuid === subscription.creatorUuid);

        subscriptionsData.push({
          login: creator.login,
          name: creator.name,
          isVerified: creator.isVerified,
          infoShort: creator.infoShort,
          infoLong: creator.infoLong,
          maxLevel: creator.maxLevel,
          image: media.find(item => item.uuid === creator.image),
          artwork: media.find(item => item.uuid === creator.artwork),
        });
      }
    }

    return {
      count: subscriptions.length,
      listOfCreators: subscriptionsData,
    };
  }

  @Process('getOne')
  public async getOne(job: Job): Promise<Record<string, any>> {
    const login: string = _.get(job, 'data.login');
    if (!login) return;

    const encodedToken = _.get(job, 'data.token', '');
    const decodedToken = jwtDecode<any>(encodedToken);
    if (!decodedToken?.sub) return;

    const user = await this.userService.getByUuid(decodedToken?.sub);
    if (!user) return;

    const creator = await this.creatorService.getByLogin(login);
    if (!creator) return;

    const subscription = await this.subscriptionService.getOne(user, creator);
    const levels = await this.subscriptionLevelService.getByCreator(creator);

    return {
      isSubscribed: !!subscription,
      isNotificationTurnedOn: subscription?.isNotificationed || false,
      level: levels.find(item => item.uuid === subscription?.subscriptionLevelUuid)?.level,
      prices: levels.map(item => _.pick(item, ['level', 'price'])),
    };
  }

  @Process('change')
  public async change(job: Job): Promise<Record<string, any>> {
    const login: string = _.get(job, 'data.login');
    const level: number = _.get(job, 'data.level');
    if (!login) return;

    const encodedToken = _.get(job, 'data.token', '');
    const decodedToken = jwtDecode<any>(encodedToken);
    if (!decodedToken?.sub) return;

    const user = await this.userService.getByUuid(decodedToken?.sub);
    if (!user) return;

    const creator = await this.creatorService.getByLogin(login);
    if (!creator) return;

    const subscription = await this.subscriptionService.getOne(user, creator);
    const levels = await this.subscriptionLevelService.getByCreator(creator);

    if (!level) {
      if (!subscription) {
        return { success: false };
      }

      await this.subscriptionService.remove(subscription);
      return {
        success: true,
        subscription: false,
      };
    }

    const subscriptionLevel = levels.find(item => item.level === level);
    if (!subscriptionLevel) {
      return { success: false };
    }

    if (!subscription) {
      await this.subscriptionService.create(user, creator, subscriptionLevel);
      return {
        success: true,
        subscription: true,
        level,
      };
    }

    await this.subscriptionService.edit(subscription, subscriptionLevel);
    return {
      success: true,
      subscription: true,
      level,
    };
  }

  @Process('notification')
  public async notification(job: Job): Promise<Record<string, any>> {
    const login: string = _.get(job, 'data.login');
    if (!login) return;

    const encodedToken = _.get(job, 'data.token', '');
    const decodedToken = jwtDecode<any>(encodedToken);
    if (!decodedToken?.sub) return;

    const user = await this.userService.getByUuid(decodedToken?.sub);
    if (!user) return;

    const creator = await this.creatorService.getByLogin(login);
    if (!creator) return;

    let subscription = await this.subscriptionService.getOne(user, creator);
    if (!subscription) return;

    subscription = await this.subscriptionService.setNotificationed(subscription, !subscription?.isNotificationed);
    return {
      success: true,
      isNotificationTurnedOn: subscription?.isNotificationed,
    };
  }
}
