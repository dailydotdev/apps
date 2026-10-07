import { useSyncExternalStore } from 'react';
import type { Query, QueryClient } from '@tanstack/react-query';
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
// request. Resetting it goes back to the first page, where invalidating
// would refetch every page the member had scrolled through, and everything
// else mounted (boot, streak, squads, ads) is left alone.
const isRootFeed = (query: Query): boolean =>
  Array.isArray(
    (query.state.data as { pages?: unknown[] } | undefined)?.pages,
  ) && query.queryKey[0] !== RequestKey.Ads;

export const refreshShell = async (queryClient: QueryClient): Promise<void> => {
  // Picked before the reset: a reset query has no pages left to be told by.
  const feeds = queryClient
    .getQueryCache()
    .findAll({ type: 'active', predicate: isRootFeed });

  set(true);
  try {
    await Promise.race([
      Promise.all(
        feeds.map(({ queryKey }) =>
          queryClient.resetQueries(
            { queryKey, exact: true },
            { throwOnError: false },
          ),
        ),
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
