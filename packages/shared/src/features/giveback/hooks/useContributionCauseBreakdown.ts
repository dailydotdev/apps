import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { CONTRIBUTION_CAUSE_BREAKDOWN_QUERY } from '../graphql';
import type { ContributionCauseCategoryBreakdown } from '../types';

interface ContributionCauseBreakdownResult {
  contributionCauseBreakdown: ContributionCauseCategoryBreakdown[];
}

interface UseContributionCauseBreakdown {
  breakdown: ContributionCauseCategoryBreakdown[];
  isPending: boolean;
}

// Where the closed campaign's pool goes, grouped by cause category. Public data,
// so it resolves for anonymous visitors too.
export const useContributionCauseBreakdown =
  (): UseContributionCauseBreakdown => {
    const { isAuthReady } = useAuthContext();

    const { data, isPending } = useQuery({
      queryKey: generateQueryKey(RequestKey.ContributionCauseBreakdown),
      queryFn: () =>
        gqlClient.request<ContributionCauseBreakdownResult>(
          CONTRIBUTION_CAUSE_BREAKDOWN_QUERY,
        ),
      enabled: isAuthReady,
      staleTime: StaleTime.Default,
      ...disabledRefetch,
    });

    return {
      breakdown: data?.contributionCauseBreakdown ?? [],
      isPending,
    };
  };
