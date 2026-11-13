import type { UseMutateAsyncFunction } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subDays } from 'date-fns';
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

// The API credits the view in a worker after the mutation resolves, so the
// first refetch can miss it. Give the worker this long before asking again.
export const STREAK_REFETCH_RETRY_DELAY_MS = 2000;

// Only bump when today's read surely extends the streak: a new or reset
// streak, or one last read yesterday. After a longer gap (weekend off days,
// freezes, a reset the cache has not seen yet) the API decides, so wait for it.
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
    shouldEvaluate: !!user && !isCompanion,
  });
  // The companion cannot persist the retry queue, so it keeps the old flow.
  const isOptimistic = isOptimisticView && !isCompanion;
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

      if (
        !isOptimistic ||
        !shouldRefetchStreak ||
        !streak ||
        !canBumpStreak(streak, user?.timezone)
      ) {
        return { shouldRefetchStreak };
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

      return { previousStreak: streak, optimisticStreak, shouldRefetchStreak };
    },
    onSuccess: async (_, __, context) => {
      if (!context.shouldRefetchStreak) {
        return null;
      }

      const { optimisticStreak } = context;
      const refetchStreak = async (): Promise<boolean> => {
        await client.refetchQueries({ queryKey: streakKey });

        return includesThisRead(
          client.getQueryData<UserStreak>(streakKey),
          user?.timezone,
          optimisticStreak?.current,
        );
      };
      const isCounted = await refetchStreak();

      // A refetch that still has the pre-view streak would undo the
      // optimistic bump, so keep the bump and ask once more after a moment.
      if (optimisticStreak && !isCounted) {
        client.setQueryData<UserStreak>(streakKey, optimisticStreak);
        await wait(STREAK_REFETCH_RETRY_DELAY_MS);

        if (!(await refetchStreak())) {
          client.setQueryData<UserStreak>(streakKey, optimisticStreak);
        }
      }

      // just mark the query as stale
      await client.invalidateQueries({ queryKey: readKey });

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

      // Only a read that would have counted for today's streak is worth a
      // replay; later reads add nothing to it.
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
