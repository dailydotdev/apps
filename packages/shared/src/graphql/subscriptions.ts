import { Client, createClient } from 'graphql-ws';

export function createSubscriptionClient(token: string): Client {
  return createClient({
    url: process.env.NEXT_PUBLIC_SUBS_URL,
    lazy: false,
    connectionParams: { token },
  });
}
