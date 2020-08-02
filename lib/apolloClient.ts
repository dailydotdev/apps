import { useMemo } from 'react';
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { IncomingMessage } from 'http';

type Client = ApolloClient<NormalizedCacheObject>;

let apolloClient: Client;

function createApolloClient(req?: IncomingMessage): Client {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: new HttpLink({
      uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
      credentials: 'same-origin',
      useGETForQueries: true,
      headers: req ? { cookie: req.headers.cookie } : undefined,
    }),
    cache: new InMemoryCache(),
  });
}

interface InitializeParams {
  initialState?: NormalizedCacheObject;
  req?: IncomingMessage;
}

export function initializeApollo({
  initialState = null,
  req,
}: InitializeParams): Client {
  const _apolloClient = apolloClient ?? createApolloClient(req);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    _apolloClient.cache.restore(initialState);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function useApollo(initialState: NormalizedCacheObject): Client {
  return useMemo(() => initializeApollo({ initialState }), [initialState]);
}
