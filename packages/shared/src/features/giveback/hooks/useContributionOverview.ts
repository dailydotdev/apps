import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Connection } from '../../../graphql/common';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { CONTRIBUTION_OVERVIEW_QUERY } from '../graphql';
import type { ContributionSponsor, ContributionStatus } from '../types';

interface ContributionOverview {
  contributionStatus: ContributionStatus;
  contributionSponsors: Connection<ContributionSponsor>;
}

const MAX_SPONSORS = 100;

// Shared query behind the funding summary and the sponsor wall. Both surfaces
// load together on the hero, so they read from one request: the two public
// hooks call this with the same key and React Query dedupes them. Keyed by user
// because the status carries user-specific fields.
export const useContributionOverview =
  (): UseQueryResult<ContributionOverview> => {
    const { user, isAuthReady } = useAuthContext();

    return useQuery({
      queryKey: generateQueryKey(RequestKey.ContributionOverview, user),
      queryFn: () =>
        gqlClient.request<ContributionOverview>(CONTRIBUTION_OVERVIEW_QUERY, {
          first: MAX_SPONSORS,
        }),
      enabled: isAuthReady,
      staleTime: StaleTime.Default,
      ...disabledRefetch,
    });
  };
