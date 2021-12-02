import { DependencyList, useContext, useEffect, useRef } from 'react';
import SubscriptionContext from '../contexts/SubscriptionContext';

export interface SubscriptionCallbacks<T> {
  next?: (value: T) => unknown;
  error?: (error: unknown) => unknown;
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
        next: (value: T) => {
          nextRef.current?.(value);
        },
        error: (subscribeError) => errorRef.current?.(subscribeError),
        complete: () => {},
      });
    }
    return undefined;
  }, [connected, ...(deps ?? [])]);
}
