import { useQuery } from '@tanstack/react-query';
import { useContext, useMemo } from 'react';
import { getUserExperiencesByType } from '../../../graphql/user/profile';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import type {
  UserExperience,
  UserExperienceType,
} from '../../../graphql/user/profile';
import AuthContext from '../../../contexts/AuthContext';

export function useUserExperiencesByType(type: UserExperienceType) {
  const { user } = useContext(AuthContext);
  const queryKey = generateQueryKey(
    RequestKey.UserExperience,
    { id: user?.id },
    type,
    'settings',
  );

  const query = useQuery({
    queryKey,
    queryFn: () => getUserExperiencesByType(user?.id, type),
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
