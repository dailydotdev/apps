import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Connection } from '../../../graphql/common';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { CONTRIBUTION_OVERVIEW_QUERY } from '../graphql';
import type {
  ContributionCauseCategoryBreakdown,
  ContributionSponsor,
  ContributionStatus,
} from '../types';

interface ContributionOverview {
  contributionStatus: ContributionStatus;
  // Optional while the sponsor wall is disabled in the query (see
  // CONTRIBUTION_OVERVIEW_QUERY); the field isn't fetched today.
  contributionSponsors?: Connection<ContributionSponsor>;
  contributionCauseBreakdown: ContributionCauseCategoryBreakdown[];
}

// Shared query behind the funding summary and the causes breakdown. Both
// surfaces load together on the hero, so they read from one request: the public
// facade hooks call this with the same key and React Query dedupes them. Keyed
// by user because the status carries user-specific fields.
export const useContributionOverview =
  (): UseQueryResult<ContributionOverview> => {
    const { user, isAuthReady } = useAuthContext();

    return useQuery({
      queryKey: generateQueryKey(RequestKey.ContributionOverview, user),
      queryFn: () =>
        gqlClient.request<ContributionOverview>(CONTRIBUTION_OVERVIEW_QUERY),
      enabled: isAuthReady,
      staleTime: StaleTime.Default,
      ...disabledRefetch,
    });
  };
