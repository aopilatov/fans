export interface Subscription {
  isSubscribed: boolean;
  isNotificationTurnedOn: boolean;
  level: number;
  prices: SubscriptionPrice[];
}

export type SubscriptionLevel = 1 | 2 | 3;

export interface SubscriptionPrice {
  level: number;
  price: number;
}
