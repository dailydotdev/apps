import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { StreakRecoverQuery } from '../../graphql/users';
import {
  isStreakEarnedBack,
  USER_STREAK_RECOVER_QUERY,
} from '../../graphql/users';
import { gqlClient } from '../../graphql/common';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useToastNotification } from '../useToastNotification';
import { LogEvent } from '../../lib/log';

export const getStreakEarnedBackCopy = (days: number): string =>
  days > 0 ? `Your ${days}-day streak is back.` : 'Your streak is back.';

// The view worker restores the streak asynchronously, so the read that should
// earn it back may not be counted on the first refetch yet
export const STREAK_EARN_BACK_RETRY_MS = 2000;

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// Called after every counted read. While the earn-back offer is open (the
// recover query is cached with earnBack && canRecover), it refreshes the
// progress; when the read earned the streak back it toasts, refetches the
// streak and resolves true so the caller can skip the daily celebration toast.
export const useStreakEarnBackProgress = (): (() => Promise<boolean>) => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();

  return useCallback(async () => {
    const recoverKey = generateQueryKey(RequestKey.UserStreakRecover);
    const previous =
      client.getQueryData<StreakRecoverQuery>(recoverKey)?.streakRecover;

    if (!user || !previous?.earnBack || !previous.canRecover) {
      return false;
    }

    const refetch = async () => {
      await client.invalidateQueries({
        queryKey: recoverKey,
        refetchType: 'none',
      });

      return (
        await client.fetchQuery<StreakRecoverQuery>({
          queryKey: recoverKey,
          queryFn: () => gqlClient.request(USER_STREAK_RECOVER_QUERY),
        })
      )?.streakRecover;
    };

    try {
      let next = await refetch();
      const shouldHaveEarnedBack =
        (previous.postsRead ?? 0) + 1 >= (previous.postsRequired ?? 0);
      if (
        !isStreakEarnedBack(next) &&
        shouldHaveEarnedBack &&
        next?.canRecover &&
        next.postsRead === previous.postsRead
      ) {
        await wait(STREAK_EARN_BACK_RETRY_MS);
        next = await refetch();
      }

      if (!isStreakEarnedBack(next)) {
        return false;
      }

      // The restore cleared the offer, so the response no longer carries the
      // old length: keep it from before for the modal's success state
      client.setQueryData<StreakRecoverQuery>(recoverKey, {
        streakRecover: { ...next, oldStreakLength: previous.oldStreakLength },
      });
      await client.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.UserStreak, user),
      });
      displayToast(getStreakEarnedBackCopy(previous.oldStreakLength));
      logEvent({
        event_name: LogEvent.StreakRecover,
        extra: JSON.stringify({ method: 'earn_back' }),
      });

      return true;
    } catch {
      return false;
    }
  }, [client, displayToast, logEvent, user]);
};
