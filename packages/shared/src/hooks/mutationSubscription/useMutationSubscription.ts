import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { mutationSuccessSubscribers } from '../../lib/query';
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
    const subscriptionId = (mutationSuccessSubscribers.size + 1).toString();

    mutationSuccessSubscribers.set(
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
      mutationSuccessSubscribers.delete(subscriptionId);
    };
  }, [queryClient]);
};
