import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { PublicProfile } from '../../../lib/user';
import { getUserGithubRepositories } from '../../../graphql/github';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';

export function useUserGithubRepos(user: PublicProfile | null) {
  const hasGithub = useMemo(() => {
    if (!user?.socialLinks) {
      return false;
    }
    return user.socialLinks.some((link) => link.platform === 'github');
  }, [user?.socialLinks]);

  const queryKey = generateQueryKey(
    RequestKey.UserGithubRepos,
    user,
    'profile',
  );

  const query = useQuery({
    queryKey,
    queryFn: () => getUserGithubRepositories(user?.id as string),
    staleTime: StaleTime.Default,
    enabled: !!user?.id && hasGithub,
  });

  const repos = useMemo(() => query.data ?? [], [query.data]);

  return {
    ...query,
    repos,
    hasGithub,
  };
}
