export interface Subscription {
  isSubscribed: boolean;
  isNotificationTurnedOn: boolean;
  level: SubscriptionLevel;
  prices: SubscriptionPrice[];
}

export type SubscriptionLevel = 1 | 2 | 3;

export interface SubscriptionPrice {
  level: SubscriptionLevel;
  price: number;
}
