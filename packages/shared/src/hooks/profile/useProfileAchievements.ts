import { useQuery } from '@tanstack/react-query';
import type { PublicProfile } from '../../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { UserAchievement } from '../../graphql/user/achievements';
import { getUserAchievements } from '../../graphql/user/achievements';

interface UseProfileAchievementsResult {
  achievements: UserAchievement[] | undefined;
  unlockedCount: number;
  totalCount: number;
  isPending: boolean;
  isError: boolean;
}

export function useProfileAchievements(
  user: PublicProfile,
): UseProfileAchievementsResult {
  const queryKey = generateQueryKey(
    RequestKey.UserAchievements,
    user,
    'profile',
  );

  const { data, isPending, isError } = useQuery({
    queryKey,
    queryFn: () => getUserAchievements(user.id),
    staleTime: StaleTime.Default,
    enabled: !!user?.id,
  });

  const unlockedCount = data?.filter((a) => a.unlockedAt !== null).length ?? 0;
  const totalCount = data?.length ?? 0;

  return {
    achievements: data,
    unlockedCount,
    totalCount,
    isPending,
    isError,
  };
}
