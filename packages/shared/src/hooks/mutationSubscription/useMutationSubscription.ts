import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UseMutationSubscription, UseMutationSubscriptionProps } from './types';

export const useMutationSubscription = ({
  matcher,
  callback,
}: UseMutationSubscriptionProps): UseMutationSubscription => {
  const queryClient = useQueryClient();

  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const matcherRef = useRef(matcher);
  matcherRef.current = matcher;

  useEffect(() => {
    const subscriptionId = (
      globalThis.mutationSuccessSubscribers.size + 1
    ).toString();

    globalThis.mutationSuccessSubscribers.set(
      subscriptionId,
      (data, variables, context, mutation) => {
        if (!matcherRef.current({ status: 'success', mutation, variables })) {
          return;
        }

        callbackRef.current({
          status: 'success',
          mutation,
          queryClient,
          variables,
        });
      },
    );

    return () => {
      globalThis.mutationSuccessSubscribers.delete(subscriptionId);
    };
  }, [queryClient]);
};
