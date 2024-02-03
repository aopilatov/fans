import { SubscriptionLevel } from './subscription';

export interface Creator {
  login: string;
  name: string;
  isVerified: boolean;
  image?: Record<string, any>[];
  artwork?: Record<string, any>[];
  infoShort: string;
  infoLong?: string;
  maxLevel: SubscriptionLevel;
}
