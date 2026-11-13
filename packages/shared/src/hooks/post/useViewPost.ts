import type { UseMutateAsyncFunction } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { VIEW_POST_MUTATION } from '../../graphql/posts';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import type { UserStreak } from '../../graphql/users';
import { isSameDayInTimezone } from '../../lib/timezones';
import { useRequestProtocol } from '../useRequestProtocol';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureStreakOptimisticView } from '../../lib/featureManagement';
import {
  enqueueStreakView,
  isFinalViewRejection,
} from '../../lib/streakViewQueue';
import { includesThisRead } from '../../lib/userStreak';
import { useStreakDailyCelebration } from '../streaks/useStreakDailyCelebration';
import { useStreakEarnBackProgress } from '../streaks/useStreakEarnBackProgress';

// The API credits the view in a worker after the mutation resolves, so the
// first refetch can miss it. Give the worker this long before asking again.
export const STREAK_REFETCH_RETRY_DELAY_MS = 2000;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

interface ViewPostContext {
  previousStreak?: UserStreak;
  optimisticStreak?: UserStreak;
  shouldRefetchStreak: boolean;
  // the count this view should land on, used when the refetch fails or
  // has not caught up with the view yet
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
  const { value: isOptimisticView } = useConditionalFeature({
    feature: featureStreakOptimisticView,
    shouldEvaluate: !!user,
  });
  const celebrateStreakDay = useStreakDailyCelebration();
  const checkStreakEarnBack = useStreakEarnBackProgress();
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
      const nextStreak = streak ? streak.current + 1 : undefined;

      if (!isOptimisticView || !shouldRefetchStreak || !streak) {
        return { shouldRefetchStreak, nextStreak };
      }

      const current = streak.current + 1;
      const optimisticStreak: UserStreak = {
        ...streak,
        current,
        total: streak.total + 1,
        max: Math.max(streak.max, current),
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

      // A refetch that still has the pre-view streak would undo the
      // optimistic bump, so keep the bump and ask once more after a moment.
      if (optimisticStreak && !countedStreak) {
        client.setQueryData<UserStreak>(streakKey, optimisticStreak);
        await wait(STREAK_REFETCH_RETRY_DELAY_MS);
        countedStreak = await refetchStreak();

        if (!countedStreak) {
          client.setQueryData<UserStreak>(streakKey, optimisticStreak);
        }
      }

      // just mark the query as stale
      await client.invalidateQueries({ queryKey: readKey });

      if (!isStreakEarnedBack) {
        celebrateStreakDay(countedStreak?.current ?? context.nextStreak);
      }

      return null;
    },
    onError: (error, id, context) => {
      if (!isOptimisticView || isCompanion) {
        return;
      }

      if (isFinalViewRejection(error)) {
        if (context?.previousStreak) {
          client.setQueryData(streakKey, context.previousStreak);
        }

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
