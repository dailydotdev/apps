import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  getTrackedAchievement,
  trackAchievement as trackAchievementRequest,
  untrackAchievement as untrackAchievementRequest,
} from '../../graphql/user/achievements';
import type { UserAchievement } from '../../graphql/user/achievements';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';

interface UseTrackedAchievementResult {
  trackedAchievement: UserAchievement | null | undefined;
  isPending: boolean;
  isError: boolean;
  trackAchievement: (achievementId: string) => Promise<void>;
  untrackAchievement: () => Promise<void>;
  isTrackPending: boolean;
  isUntrackPending: boolean;
}

export const useTrackedAchievement = (
  profileUserId?: string,
  shouldQuery = true,
): UseTrackedAchievementResult => {
  const queryClient = useQueryClient();
  const { user: loggedUser } = useAuthContext();

  const trackedAchievementQueryKey = generateQueryKey(
    RequestKey.TrackedAchievement,
    loggedUser,
    'profile',
  );

  const userAchievementsQueryKey = profileUserId
    ? generateQueryKey(
        RequestKey.UserAchievements,
        { id: profileUserId },
        'profile',
      )
    : null;

  const { data, isPending, isError } = useQuery({
    queryKey: trackedAchievementQueryKey,
    queryFn: getTrackedAchievement,
    staleTime: StaleTime.Default,
    enabled: shouldQuery && !!loggedUser?.id,
  });

  const { mutateAsync: trackMutation, isPending: isTrackPending } = useMutation(
    {
      mutationFn: trackAchievementRequest,
      onSuccess: (achievement) => {
        queryClient.setQueryData(trackedAchievementQueryKey, achievement);

        if (userAchievementsQueryKey) {
          queryClient.invalidateQueries({ queryKey: userAchievementsQueryKey });
        }
      },
    },
  );

  const { mutateAsync: untrackMutation, isPending: isUntrackPending } =
    useMutation({
      mutationFn: untrackAchievementRequest,
      onSuccess: () => {
        queryClient.setQueryData(trackedAchievementQueryKey, null);

        if (userAchievementsQueryKey) {
          queryClient.invalidateQueries({ queryKey: userAchievementsQueryKey });
        }
      },
    });

  const trackAchievement = useCallback(
    async (achievementId: string) => {
      if (!loggedUser?.id) {
        throw new Error('Only authenticated users can track achievements.');
      }

      await trackMutation(achievementId);
    },
    [loggedUser?.id, trackMutation],
  );

  const untrackAchievement = useCallback(async () => {
    if (!loggedUser?.id) {
      throw new Error('Only authenticated users can untrack achievements.');
    }

    await untrackMutation();
  }, [loggedUser?.id, untrackMutation]);

  return {
    trackedAchievement: data,
    isPending,
    isError,
    trackAchievement,
    untrackAchievement,
    isTrackPending,
    isUntrackPending,
  };
};
