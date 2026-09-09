import { queryOptions } from '@tanstack/react-query';
import { gqlBatchRequest } from '../../graphql/batch';
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
      gqlBatchRequest<HackathonParticipationData>(
        HACKATHON_PARTICIPATION_QUERY,
      ),
    enabled: !!user?.id,
    staleTime: Infinity,
  });
