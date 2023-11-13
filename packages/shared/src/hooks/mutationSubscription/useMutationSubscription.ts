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
    const unsubscribe = queryClient.getMutationCache().subscribe((mutation) => {
      if (!matcherRef.current({ mutation: mutation.mutation })) {
        return;
      }

      callbackRef.current({ mutation: mutation.mutation, queryClient });
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);
};
