import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import { ClientError } from 'graphql-request';
import { globalMutationCache, RequestKey, StaleTime } from './query';
import { GARMR_ERROR } from '../graphql/common';

export const persistedQueryClient = new QueryClient({
  mutationCache: globalMutationCache,
  defaultOptions: {
    queries: {
      staleTime: StaleTime.OneHour,
      // TODO: When upgrading to version 5, this needs to be renamed to gcTime
      cacheTime: StaleTime.OneDay,
      retry: (failureCount, error) => {
        const clientError = error as ClientError;
        if (
          clientError?.response?.errors?.[0]?.extensions?.code === GARMR_ERROR
        ) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: process.env.NODE_ENV !== 'development',
    },
  },
});

export const queryClientPersister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
});

export const persistedQueryClientOptions: Omit<
  PersistQueryClientOptions,
  'queryClient'
> = {
  persister: queryClientPersister,
  dehydrateOptions: {
    shouldDehydrateQuery: ({ queryKey }) => {
      return queryKey[0] === RequestKey.Squads;
    },
  },
};
