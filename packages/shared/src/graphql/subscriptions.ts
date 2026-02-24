import type { Client } from 'graphql-ws';
import { createClient } from 'graphql-ws';

export function createSubscriptionClient(token: string): Client {
  const subscriptionUrl = process.env.NEXT_PUBLIC_SUBS_URL;
  if (!subscriptionUrl) {
    throw new Error('NEXT_PUBLIC_SUBS_URL is required');
  }

  return createClient({
    url: subscriptionUrl,
    lazy: false,
    connectionParams: { token },
  });
}
