import { useQuery } from '@tanstack/react-query';
import type { PublicProfile } from '../../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { UserAchievement } from '../../graphql/user/achievements';
import { getShowcasedAchievements } from '../../graphql/user/achievements';

interface UseShowcasedAchievementsResult {
  achievements: UserAchievement[] | undefined;
  isPending: boolean;
}

export function useShowcasedAchievements(
  user: PublicProfile,
): UseShowcasedAchievementsResult {
  const queryKey = generateQueryKey(
    RequestKey.ShowcasedAchievements,
    user,
    'profile',
  );

  const { data, isPending } = useQuery({
    queryKey,
    queryFn: () => getShowcasedAchievements(user.id),
    staleTime: StaleTime.Default,
    enabled: !!user?.id,
  });

  return {
    achievements: data,
    isPending,
  };
}
