import { SubscriptionClient } from 'subscriptions-transport-ws';

export const subscriptionClient = new SubscriptionClient(
  process.env.NEXT_PUBLIC_SUBS_URL,
  {
    reconnect: true,
  },
);
