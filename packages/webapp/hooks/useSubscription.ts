import { DependencyList, useContext, useEffect, useRef } from 'react';
import SubscriptionContext from '../contexts/SubscriptionContext';
import { OperationOptions } from 'subscriptions-transport-ws';

interface Payload<T> {
  data: T;
}

export interface SubscriptionCallbacks<T> {
  next?: (value: T) => unknown;
  error?: (error: Error) => unknown;
}

export default function useSubscription<T>(
  request: () => OperationOptions,
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
      const observable = subscriptionClient.request(request());
      const { unsubscribe } = observable.subscribe({
        next: (value: Payload<T>) => {
          nextRef.current?.(value.data);
        },
        error: (error) => errorRef.current?.(error),
      });
      return unsubscribe;
    }
  }, [connected, ...(deps ?? [])]);
}
