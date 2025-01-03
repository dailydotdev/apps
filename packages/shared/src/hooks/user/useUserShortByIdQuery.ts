import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { USER_SHORT_BY_ID } from '../../graphql/users';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { gqlClient } from '../../graphql/common';
import type { PublicProfile } from '../../lib/user';

import { useAuthContext } from '../../contexts/AuthContext';

export type UseUserShortByIdQuery = UseQueryResult<PublicProfile>;
export const useUserShortByIdQuery = ({
  id,
  initialData,
}: {
  id: string;
  initialData?: PublicProfile;
}): UseUserShortByIdQuery => {
  const { user } = useAuthContext();
  const queryKey = generateQueryKey(RequestKey.UserShortById, user, { id });

  const queryResult = useQuery({
    queryKey,
    queryFn: async (): Promise<PublicProfile> => {
      const res = await gqlClient.request(USER_SHORT_BY_ID, { id });
      return res.user;
    },
    staleTime: StaleTime.Default,
    enabled: !!id && user?.id !== id,
    initialData,
  });

  return queryResult;
};
