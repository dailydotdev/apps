import type { UseMutateAsyncFunction } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import { VIEW_POST_MUTATION } from '../../graphql/posts';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import type { UserStreak } from '../../graphql/users';
import { isSameDayInTimezone } from '../../lib/timezones';
import { useRequestProtocol } from '../useRequestProtocol';
import {
  enqueueStreakView,
  isFinalViewRejection,
} from '../../lib/streakViewQueue';
import { includesThisRead } from '../../lib/userStreak';
import { useStreakDailyCelebration } from '../streaks/useStreakDailyCelebration';
import { useStreakEarnBackProgress } from '../streaks/useStreakEarnBackProgress';
import { useStreakGoalCelebration } from '../streaks/useStreakGoalCelebration';

// The API credits the view in a worker after the mutation resolves, so the
// first refetch can miss it. Give the worker this long before asking again.
export const STREAK_REFETCH_RETRY_DELAY_MS = 2000;

// After a longer gap the API decides (off days, freezes, a reset)
const canBumpStreak = (
  streak: UserStreak,
  timezone?: string,
  now: Date = new Date(),
): boolean =>
  !streak.lastViewAt ||
  streak.current === 0 ||
  isSameDayInTimezone(new Date(streak.lastViewAt), subDays(now, 1), timezone);

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

interface ViewPostContext {
  previousStreak?: UserStreak;
  optimisticStreak?: UserStreak;
  shouldRefetchStreak: boolean;
  // the count this view should land on, to recognize a refetch that already
  // includes it
  nextStreak?: number;
}

export const useViewPost = (): UseMutateAsyncFunction<
  unknown,
  unknown,
  string,
  ViewPostContext
> => {
  const client = useQueryClient();
  const { requestMethod, isCompanion } = useRequestProtocol();
  const { user } = useAuthContext();
  // the companion keeps waiting for the server value
  const isOptimistic = !isCompanion;
  const celebrateStreakDay = useStreakDailyCelebration();
  const checkStreakEarnBack = useStreakEarnBackProgress();
  const celebrateStreakGoal = useStreakGoalCelebration();
  const streakKey = generateQueryKey(RequestKey.UserStreak, user);
  const readKey = generateQueryKey(RequestKey.ReadingStreak30Days, user);
  const { mutateAsync: onSendViewPost } = useMutation<
    unknown,
    unknown,
    string,
    ViewPostContext
  >({
    mutationFn: (id: string) => requestMethod(VIEW_POST_MUTATION, { id }),
    onMutate: () => {
      const streak = client.getQueryData<UserStreak>(streakKey);
      const isNewStreak = !streak?.lastViewAt;
      const isFirstViewToday =
        !isNewStreak &&
        !isSameDayInTimezone(
          new Date(streak!.lastViewAt!),
          new Date(),
          user!.timezone,
        );
      const shouldRefetchStreak = isNewStreak || isFirstViewToday;
      const nextStreak =
        streak && canBumpStreak(streak, user?.timezone)
          ? streak.current + 1
          : undefined;

      if (!isOptimistic || !shouldRefetchStreak || nextStreak === undefined) {
        return { shouldRefetchStreak, nextStreak };
      }

      const optimisticStreak: UserStreak = {
        ...streak!,
        current: nextStreak,
        total: streak!.total + 1,
        max: Math.max(streak!.max, nextStreak),
        lastViewAt: new Date(),
      };
      client.setQueryData<UserStreak>(streakKey, optimisticStreak);

      return {
        previousStreak: streak,
        optimisticStreak,
        shouldRefetchStreak,
        nextStreak,
      };
    },
    onSuccess: async (_, __, context) => {
      const isStreakEarnedBack = await checkStreakEarnBack();
      if (!context.shouldRefetchStreak) {
        return null;
      }

      const { optimisticStreak } = context;
      // Resolves with the refetched streak only when it already counts this
      // view: the API credits it in a worker, so it can still be the
      // pre-view streak.
      const refetchStreak = async (): Promise<UserStreak | undefined> => {
        await client.refetchQueries({ queryKey: streakKey });
        const refetched = client.getQueryData<UserStreak>(streakKey);

        return includesThisRead(
          refetched,
          user?.timezone,
          optimisticStreak?.current ?? context.nextStreak,
        )
          ? refetched
          : undefined;
      };
      let countedStreak = await refetchStreak();

      // The worker may not have credited the view yet: keep the optimistic
      // bump and ask once more after a moment. A retry that is still stale
      // means the API skipped the view (it ignores a post the user viewed in
      // the past week), so the server value it returned stays.
      if (!countedStreak) {
        if (optimisticStreak) {
          client.setQueryData<UserStreak>(streakKey, optimisticStreak);
        }
        await wait(STREAK_REFETCH_RETRY_DELAY_MS);
        countedStreak = await refetchStreak();
      }

      // just mark the query as stale
      await client.invalidateQueries({ queryKey: readKey });

      // a restored streak is not a new day, so it gets neither the goal nor
      // the day celebration. Only a count the API confirmed: a guess could
      // celebrate a day that never counted and suppress the toast for the
      // read that does, or hit or miss the goal
      if (!isStreakEarnedBack) {
        const current = countedStreak?.current;
        if (!celebrateStreakGoal(current)) {
          celebrateStreakDay(current);
        }
      }

      return null;
    },
    onError: (error, id, context) => {
      if (!isOptimistic) {
        return;
      }

      if (isFinalViewRejection(error)) {
        if (context?.previousStreak) {
          client.setQueryData(streakKey, context.previousStreak);
        }

        return;
      }

      if (!context?.shouldRefetchStreak) {
        return;
      }

      enqueueStreakView({
        postId: id,
        userId: user!.id,
        at: Date.now(),
        timezone: user?.timezone,
      });
    },
  });

  return onSendViewPost;
};
