import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Connection } from '../../../graphql/common';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { CONTRIBUTION_CAUSE_PREFERENCES_QUERY } from '../graphql';

interface UseContributionCausePreferences {
  selectedCauseIds: string[];
  isPending: boolean;
}

const MAX_CAUSES = 100;

// The visitor's already-picked causes, used to seed the picker so editing
// starts from their current selection. Keyed by user so it refetches on
// sign-in/out.
export const useContributionCausePreferences = (
  enabled: boolean,
): UseContributionCausePreferences => {
  const { isAuthReady, user } = useAuthContext();
  const shouldFetch = isAuthReady && !!user && enabled;

  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.ContributionCausePreferences, user),
    queryFn: async () => {
      const res = await gqlClient.request<{
        contributionCausePreferences: Connection<{ id: string }>;
      }>(CONTRIBUTION_CAUSE_PREFERENCES_QUERY, { first: MAX_CAUSES });

      return res.contributionCausePreferences.edges.map((edge) => edge.node.id);
    },
    enabled: shouldFetch,
    staleTime: StaleTime.Default,
    ...disabledRefetch,
  });

  return {
    selectedCauseIds: data ?? [],
    isPending: shouldFetch && isPending,
  };
};
