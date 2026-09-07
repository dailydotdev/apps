import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAchievementTracker } from '../../graphql/user/achievements';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { disabledRefetch } from '../../lib/func';
import { useAuthContext } from '../../contexts/AuthContext';

interface UseAchievementTracker {
  isSettled: boolean;
}

export const useAchievementTracker = (
  shouldQuery: boolean,
): UseAchievementTracker => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const enabled = !!user?.id && shouldQuery;

  const { isFetched } = useQuery({
    queryKey: generateQueryKey(RequestKey.AchievementTracker, user),
    queryFn: async () => {
      const data = await getAchievementTracker(user!.id);

      queryClient.setQueryData(
        generateQueryKey(RequestKey.UserAchievements, user, 'profile'),
        data.userAchievements,
      );
      queryClient.setQueryData(
        generateQueryKey(RequestKey.TrackedAchievement, user, 'profile'),
        data.trackedAchievement,
      );

      return data;
    },
    staleTime: StaleTime.Default,
    retry: false,
    enabled,
    ...disabledRefetch,
  });

  return { isSettled: !enabled || isFetched };
};
