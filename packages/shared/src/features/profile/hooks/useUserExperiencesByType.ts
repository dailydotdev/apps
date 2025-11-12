import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getUserExperiencesByType } from '../../../graphql/user/profile';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import type {
  UserExperience,
  UserExperienceType,
} from '../../../graphql/user/profile';

export function useUserExperiencesByType(
  type: UserExperienceType,
  userId: string,
) {
  const queryKey = generateQueryKey(
    RequestKey.UserExperience,
    { id: userId },
    type,
    'settings',
  );

  const query = useQuery({
    queryKey,
    queryFn: () => getUserExperiencesByType(userId, type),
    staleTime: StaleTime.Default,
  });

  const experiences: UserExperience[] | undefined = useMemo(
    () => query.data?.edges?.map(({ node }) => node),
    [query.data],
  );

  return {
    ...query,
    experiences,
    queryKey,
  };
}
