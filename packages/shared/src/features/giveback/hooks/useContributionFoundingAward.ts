import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { CONTRIBUTION_FOUNDING_AWARD_QUERY } from '../graphql';
import type { ContributionFoundingAward } from '../types';

interface UseContributionFoundingAward {
  foundingAward?: ContributionFoundingAward;
  isPending: boolean;
}

// The founding award's live spot count + the visitor's own founding membership.
// Keyed by user since the membership fields are per-visitor; only fetched once
// the caller marks the tab reachable (signed in).
export const useContributionFoundingAward = (
  enabled: boolean,
): UseContributionFoundingAward => {
  const { isAuthReady, user } = useAuthContext();
  const shouldFetch = isAuthReady && !!user && enabled;

  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.ContributionFoundingAward, user),
    queryFn: async () => {
      const res = await gqlClient.request<{
        contributionFoundingAward: ContributionFoundingAward;
      }>(CONTRIBUTION_FOUNDING_AWARD_QUERY);

      return res.contributionFoundingAward;
    },
    enabled: shouldFetch,
    staleTime: StaleTime.Default,
    ...disabledRefetch,
  });

  return { foundingAward: data, isPending: shouldFetch && isPending };
};
