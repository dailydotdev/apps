import { createClient } from 'graphql-ws';

export const subscriptionClient = createClient({
  url: process.env.NEXT_PUBLIC_SUBS_URL,
  lazy: false,
});
