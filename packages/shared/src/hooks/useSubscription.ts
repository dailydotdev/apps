import { DependencyList, useContext, useEffect, useRef } from 'react';
import SubscriptionContext from '../contexts/SubscriptionContext';

export interface SubscriptionCallbacks<T> {
  next?: (value: T) => unknown;
  error?: (error: unknown) => unknown;
}

interface Payload<T> {
  data: T;
}

export default function useSubscription<T>(
  request: () => { query: string; variables?: Record<string, unknown> },
  { next, error }: SubscriptionCallbacks<T>,
  deps?: DependencyList,
): void {
  const { subscriptionClient, connected } = useContext(SubscriptionContext);
  const nextRef = useRef(next);
  const errorRef = useRef(error);

  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  useEffect(() => {
    errorRef.current = error;
  }, [error]);

  useEffect(() => {
    if (connected) {
      return subscriptionClient.subscribe<T>(request(), {
        next: ({ data }: Payload<T>) => {
          nextRef.current?.(data);
        },
        error: (subscribeError) => errorRef.current?.(subscribeError),
        complete: () => {},
      });
    }
    return undefined;
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, ...(deps ?? [])]);
}
