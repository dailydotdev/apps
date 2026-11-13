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
  isGraphQLRejection,
} from '../../lib/streakViewQueue';
import { useStreakDailyCelebration } from '../streaks/useStreakDailyCelebration';
import { useStreakGoalCelebration } from '../streaks/useStreakGoalCelebration';

interface ViewPostContext {
  previousStreak?: UserStreak;
  shouldRefetchStreak: boolean;
  // the count this view should land on, used when the refetch fails
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
      const nextStreak = streak ? streak.current + 1 : undefined;

      if (!isOptimisticView || !shouldRefetchStreak || !streak) {
        return { shouldRefetchStreak, nextStreak };
      }

      const current = streak.current + 1;
      client.setQueryData<UserStreak>(streakKey, {
        ...streak,
        current,
        total: streak.total + 1,
        max: Math.max(streak.max, current),
        lastViewAt: new Date(),
      });

      return { previousStreak: streak, shouldRefetchStreak, nextStreak };
    },
    onSuccess: async (_, __, context) => {
      if (context.shouldRefetchStreak) {
        await client.refetchQueries({ queryKey: streakKey });

        // just mark the query as stale
        await client.invalidateQueries({ queryKey: readKey });

        const refetched = client.getQueryState<UserStreak>(streakKey);
        const current =
          refetched?.status === 'success'
            ? refetched.data?.current
            : context.nextStreak;
        if (!celebrateStreakGoal(current)) {
          celebrateStreakDay(current);
        }
      }

      return null;
    },
    onError: (error, id, context) => {
      if (!isOptimisticView || isCompanion) {
        return;
      }

      if (isGraphQLRejection(error)) {
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
