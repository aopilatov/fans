import { Creator } from './creator';
import { Subscription, SubscriptionLevel } from './subscription';

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
  image?: string[];
  video?: string[];
  text?: string;
}

export enum PostType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
}
