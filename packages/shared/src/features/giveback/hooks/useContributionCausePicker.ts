import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Connection } from '../../../graphql/common';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { CONTRIBUTION_CAUSE_PICKER_QUERY } from '../graphql';
import type { ContributionCause } from '../types';

interface UseContributionCausePicker {
  causes: ContributionCause[];
  selectedCauseIds: string[];
  isPending: boolean;
}

const MAX_CAUSES = 100;

// The cause catalog and the visitor's saved picks in one request. Auth +
// eligibility gated on the backend, so only fetch once signed in and the picker
// is reachable (after a logged-in join) - otherwise the request 403s. Keyed by
// user since the saved picks are user-specific.
export const useContributionCausePicker = (
  enabled: boolean,
): UseContributionCausePicker => {
  const { isAuthReady, user } = useAuthContext();
  const shouldFetch = isAuthReady && !!user && enabled;

  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.ContributionCausePicker, user),
    queryFn: async () => {
      const res = await gqlClient.request<{
        contributionCauses: Connection<ContributionCause>;
        contributionCausePreferences: Connection<{ id: string }>;
      }>(CONTRIBUTION_CAUSE_PICKER_QUERY, { first: MAX_CAUSES });

      return {
        causes: res.contributionCauses.edges.map((edge) => edge.node),
        selectedCauseIds: res.contributionCausePreferences.edges.map(
          (edge) => edge.node.id,
        ),
      };
    },
    enabled: shouldFetch,
    staleTime: StaleTime.Default,
    ...disabledRefetch,
  });

  return {
    causes: data?.causes ?? [],
    selectedCauseIds: data?.selectedCauseIds ?? [],
    isPending: shouldFetch && isPending,
  };
};
