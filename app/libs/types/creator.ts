import { SubscriptionLevel } from './subscription';

export interface Creator {
  login: string;
  name: string;
  isVerified: boolean;
  image?: string;
  artwork?: string;
  infoShort: string;
  infoLong?: string;
  maxLevel: SubscriptionLevel;
}
