import { useSyncExternalStore } from 'react';
import type { InfiniteData, Query, QueryClient } from '@tanstack/react-query';
import { RequestKey } from '../../lib/query';

// A tap on the lit tab at the top of a root refreshes it; the indicator
// under the block shows for as long as the root's feed refetches.
let refreshing = false;
const listeners = new Set<() => void>();

const set = (next: boolean) => {
  refreshing = next;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// The row folds when the refetch settles, or after a bound in case a query
// never does (a failing ad slot, a socket).
const refreshBound = 5000;

// The root's list, not the page: a paged query on screen that is not an ad
// request. Everything else mounted (boot, streak, ads) is left alone.
const isRootFeed = (query: Query): boolean =>
  Array.isArray(
    (query.state.data as { pages?: unknown[] } | undefined)?.pages,
  ) && query.queryKey[0] !== RequestKey.Ads;

// Back to the first page, then refetch it in place. A reset would empty the
// query first: the feed fell back to its placeholders and a row built from
// a paged query (the squad categories) vanished until the data returned.
// Keeping one page also means only that page refetches, not every page the
// member had scrolled through.
const refreshFirstPage = (
  queryClient: QueryClient,
  queryKey: Query['queryKey'],
): Promise<void> => {
  queryClient.setQueryData<InfiniteData<unknown>>(queryKey, (data) =>
    data
      ? {
          pages: data.pages.slice(0, 1),
          pageParams: data.pageParams.slice(0, 1),
        }
      : data,
  );
  return queryClient.refetchQueries(
    { queryKey, exact: true },
    { throwOnError: false },
  );
};

export const refreshShell = async (queryClient: QueryClient): Promise<void> => {
  const feeds = queryClient
    .getQueryCache()
    .findAll({ type: 'active', predicate: isRootFeed });

  set(true);
  try {
    await Promise.race([
      Promise.all(
        feeds.map(({ queryKey }) => refreshFirstPage(queryClient, queryKey)),
      ),
      new Promise((resolve) => {
        setTimeout(resolve, refreshBound);
      }),
    ]);
  } finally {
    set(false);
  }
};

export const useShellRefreshing = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => refreshing,
    () => false,
  );
