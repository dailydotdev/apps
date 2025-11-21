import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { PublicProfile } from '../../../lib/user';
import { getUserProfileExperiences } from '../../../graphql/user/profile';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';

export function useProfileExperiences(user: PublicProfile, first?: number) {
  const queryKey = generateQueryKey(
    RequestKey.UserExperience,
    user,
    'profile',
    { first },
  );

  const query = useQuery({
    queryKey,
    queryFn: () => getUserProfileExperiences(user.id, first),
    staleTime: StaleTime.Default,
  });

  const { work, education, cert, project, opensource, volunteering } = useMemo(
    () => ({
      work: query.data?.work?.edges?.map(({ node }) => node),
      education: query.data?.education?.edges?.map(({ node }) => node),
      cert: query.data?.certification?.edges?.map(({ node }) => node),
      project: query.data?.project?.edges?.map(({ node }) => node),
      opensource: query.data?.opensource?.edges?.map(({ node }) => node),
      volunteering: query.data?.volunteering?.edges?.map(({ node }) => node),
    }),
    [query.data],
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
