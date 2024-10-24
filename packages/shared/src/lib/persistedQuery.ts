import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import { RequestKey, StaleTime } from './query';

export const persistedQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: StaleTime.OneHour,
      // TODO: When upgrading to version 5, this needs to be renamed to gcTime
      cacheTime: StaleTime.OneDay,
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
      console.log('queryKey', queryKey);
      // TODO: Figure out how to check on both first and second key.
      return queryKey[0] === RequestKey.Squads;
    },
  },
};
