import { queryOptions } from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import {
  HACKATHON_PARTICIPATION_QUERY,
  type HackathonParticipationData,
} from '../../graphql/users';
import { generateQueryKey, RequestKey } from '../../lib/query';
import type { LoggedUser } from '../../lib/user';

export const hackathonParticipationQueryOptions = (
  user?: Pick<LoggedUser, 'id'>,
) =>
  queryOptions({
    queryKey: generateQueryKey(RequestKey.HackathonParticipation, user),
    queryFn: () =>
      gqlClient.request<HackathonParticipationData>(
        HACKATHON_PARTICIPATION_QUERY,
      ),
    enabled: !!user?.id,
    staleTime: Infinity,
  });
