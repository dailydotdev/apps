import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PublicProfile } from '../../lib/user';
import type { UserAchievement } from '../../graphql/user/achievements';
import {
  getShowcaseAchievements,
  setShowcaseAchievements,
} from '../../graphql/user/achievements';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';

interface UseShowcaseAchievementsReturn {
  showcaseAchievements: UserAchievement[];
  isPending: boolean;
  setShowcase: (achievementIds: string[]) => Promise<UserAchievement[]>;
  isSetPending: boolean;
}

export function useShowcaseAchievements(
  user: PublicProfile | null | undefined,
): UseShowcaseAchievementsReturn {
  const queryClient = useQueryClient();

  const queryKey = generateQueryKey(
    RequestKey.ShowcaseAchievements,
    user,
    'profile',
  );

  const { data, isPending } = useQuery({
    queryKey,
    queryFn: () => {
      if (!user?.id) {
        throw new Error('Cannot load showcase achievements without a user id.');
      }
      return getShowcaseAchievements(user.id);
    },
    staleTime: StaleTime.Default,
    enabled: !!user?.id,
  });

  const { mutateAsync: setShowcase, isPending: isSetPending } = useMutation({
    mutationFn: (achievementIds: string[]) =>
      setShowcaseAchievements(achievementIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    showcaseAchievements: data ?? [],
    isPending,
    setShowcase,
    isSetPending,
  };
}
