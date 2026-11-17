import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { StreakRecoverQuery, UserStreak } from '../../graphql/users';
import {
  isStreakEarnedBack,
  USER_STREAK_RECOVER_QUERY,
} from '../../graphql/users';
import { gqlClient } from '../../graphql/common';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToastNotification } from '../useToastNotification';

export const getStreakEarnedBackCopy = (days: number): string =>
  days > 0 ? `Your ${days}-day streak is back.` : 'Your streak is back.';

// The view worker restores the streak asynchronously, so the read that should
// earn it back may not be counted on the first refetch yet
export const STREAK_EARN_BACK_RETRY_MS = 2000;

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// Mirrors STREAK_EARN_BACK_WINDOW_DAYS in daily-api: the offer stays open for
// three local days counting the reset day
export const STREAK_EARN_BACK_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

// Called after every counted read. While the earn-back offer is open it
// refreshes the progress; when the read earned the streak back it toasts,
// refetches the streak and resolves true so the caller can skip the daily
// celebration toast. The API logs the restore itself (the client may not be
// open when it happens), so nothing is logged here.
//
// The offer is kept in the recover query for the whole window (gcTime), so
// closing the modal does not lose it. Without a cached offer (a reload, or
// the modal never opened) it is fetched only for readers whose last reset
// falls inside the window, which the always-loaded streak tells.
export const useStreakEarnBackProgress = (): (() => Promise<boolean>) => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();

  return useCallback(async () => {
    if (!user) {
      return false;
    }

    const recoverKey = generateQueryKey(RequestKey.UserStreakRecover);
    const fetchRecover = async () => {
      await client.invalidateQueries({
        queryKey: recoverKey,
        refetchType: 'none',
      });

      return (
        await client.fetchQuery<StreakRecoverQuery>({
          queryKey: recoverKey,
          queryFn: () => gqlClient.request(USER_STREAK_RECOVER_QUERY),
          gcTime: STREAK_EARN_BACK_WINDOW_MS,
        })
      )?.streakRecover;
    };

    try {
      const cached =
        client.getQueryData<StreakRecoverQuery>(recoverKey)?.streakRecover;
      if (cached && !(cached.earnBack && cached.canRecover)) {
        return false;
      }

      if (!cached) {
        const resetAt = client.getQueryData<UserStreak>(
          generateQueryKey(RequestKey.UserStreak, user),
        )?.lastReset?.at;
        const isInWindow =
          !!resetAt &&
          Date.now() - new Date(resetAt).getTime() < STREAK_EARN_BACK_WINDOW_MS;
        if (isInWindow) {
          // Only caches the offer: without the progress from before this
          // read there is no transition to celebrate
          await fetchRecover();
        }

        return false;
      }

      const previous = cached;
      let next = await fetchRecover();
      const shouldHaveEarnedBack =
        (previous.postsRead ?? 0) + 1 >= (previous.postsRequired ?? 0);
      if (
        !isStreakEarnedBack(next) &&
        shouldHaveEarnedBack &&
        next?.canRecover &&
        next.postsRead === previous.postsRead
      ) {
        await wait(STREAK_EARN_BACK_RETRY_MS);
        next = await fetchRecover();
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

      return true;
    } catch {
      return false;
    }
  }, [client, displayToast, user]);
};
