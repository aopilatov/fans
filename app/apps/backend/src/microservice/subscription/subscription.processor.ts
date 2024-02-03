import { forwardRef, Inject } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { UserService } from '@/microservice/user';
import { CreatorService } from '@/microservice/creator';
import { MediaService } from '@/microservice/media';
import { SubscriptionService } from './subscription.service';
import { jwtDecode } from 'jwt-decode';
import * as _ from 'lodash';
import { MediaDbModel } from '@/db/model';

@Processor('subscription')
export class SubscriptionProcessor {
  constructor(
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    @Inject(forwardRef(() => CreatorService)) private readonly creatorService: CreatorService,
    private readonly subscriptionService: SubscriptionService,
    private readonly mediaService: MediaService,
  ) {}

  @Process('listForUser')
  public async getSelf(job: Job): Promise<Record<string, any>> {
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
        media = await this.mediaService.getByMediaUuids(mediaUuids);
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
          image: media.filter(item => item.mediaUuid === creator.image && item.transformation === 'none').map(item => _.pick(item, ['file', 'width', 'height'])),
          artwork: media.filter(item => item.mediaUuid === creator.artwork && item.transformation === 'none').map(item => _.pick(item, ['file', 'width', 'height'])),
        });
      }
    }

    return {
      count: subscriptions.length,
      listOfCreators: subscriptionsData,
    };
  }
}
