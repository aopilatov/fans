import { SubscriptionLevel } from './subscription';
import { Media } from './media';

export interface Creator {
  login: string;
  name: string;
  isVerified: boolean;
  image?: Media;
  artwork?: Media;
  infoShort: string;
  infoLong?: string;
  maxLevel: SubscriptionLevel;
  levels: {
    level: number;
    price: number;
  }[]
}
