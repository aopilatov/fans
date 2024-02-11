import { Creator } from './creator';
import { Subscription, SubscriptionLevel } from './subscription';
import { Media } from './media';

export interface Post {
  uuid: string;
  date: string;
  isLiked: boolean;
  type: PostType;
  level: SubscriptionLevel;
  creator: Creator;
  content: PostContent;
  subscription: Subscription;
}

export interface PostContent {
  image?: Media[];
  video?: Media[];
  text?: string;
}

export enum PostType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
}
