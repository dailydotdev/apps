import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { PublicProfile } from '../../../lib/user';
import { getUserProfileExperiences } from '../../../graphql/user/profile';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';

export function useProfileExperiences(user: PublicProfile, first?: number) {
  const fetchLimit = first ? first + 1 : undefined;

  const queryKey = generateQueryKey(
    RequestKey.UserExperience,
    user,
    'profile',
    { first: fetchLimit },
  );

  const query = useQuery({
    queryKey,
    queryFn: () => getUserProfileExperiences(user.id, fetchLimit),
    staleTime: StaleTime.Default,
  });

  const { work, education, cert, project, opensource, volunteering } = useMemo(
    () => ({
      work: query.data?.work?.edges?.map(({ node }) => node).slice(0, first),
      education: query.data?.education?.edges
        ?.map(({ node }) => node)
        .slice(0, first),
      cert: query.data?.certification?.edges
        ?.map(({ node }) => node)
        .slice(0, first),
      project: query.data?.project?.edges
        ?.map(({ node }) => node)
        .slice(0, first),
      opensource: query.data?.opensource?.edges
        ?.map(({ node }) => node)
        .slice(0, first),
      volunteering: query.data?.volunteering?.edges
        ?.map(({ node }) => node)
        .slice(0, first),
    }),
    [query.data, first],
  );

  return {
    ...query,
    work,
    education,
    cert,
    project,
    opensource,
    volunteering,
    queryKey, // Export for potential invalidations
  };
}
