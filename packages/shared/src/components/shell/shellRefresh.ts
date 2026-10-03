import { useSyncExternalStore } from 'react';
import type { QueryClient } from '@tanstack/react-query';

// A tap on the lit tab at the top of a root refreshes it; the indicator
// under the block shows for as long as the mounted queries refetch.
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

export const refreshShell = async (queryClient: QueryClient): Promise<void> => {
  set(true);
  try {
    await Promise.race([
      queryClient.invalidateQueries(
        { type: 'active' },
        { throwOnError: false },
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
