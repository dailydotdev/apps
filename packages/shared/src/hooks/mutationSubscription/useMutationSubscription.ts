import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import type {
  UseMutationSubscription,
  UseMutationSubscriptionProps,
} from './types';
import { mutationSuccessSubscribers } from '../../lib/query';

export const useMutationSubscription = <TVariables = unknown>({
  matcher,
  callback,
}: UseMutationSubscriptionProps<TVariables>): UseMutationSubscription => {
  const queryClient = useQueryClient();

  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const matcherRef = useRef(matcher);
  matcherRef.current = matcher;

  useEffect(() => {
    const subscriptionId = uuidv4();

    mutationSuccessSubscribers.set(
      subscriptionId,
      (_, variables, __, mutation) => {
        const typedVariables = variables as TVariables | undefined;

        if (
          !matcherRef.current({
            status: 'success',
            mutation,
            variables: typedVariables,
          })
        ) {
          return;
        }

        callbackRef.current({
          status: 'success',
          mutation,
          queryClient,
          variables: typedVariables,
        });
      },
    );

    return () => {
      mutationSuccessSubscribers.delete(subscriptionId);
    };
  }, [queryClient]);
};
