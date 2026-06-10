import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Connection } from '../../../graphql/common';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { CONTRIBUTION_ACTIONS_QUERY } from '../graphql';
import type { ContributionAction, ContributionActionCategory } from '../types';

interface UseContributionActions {
  actions: ContributionAction[];
  categories: ContributionActionCategory[];
  isPending: boolean;
}

const MAX_ACTIONS = 100;

// The action catalog and its filter categories in one request. Auth +
// eligibility gated on the backend (the catalog only renders once a visitor has
// joined and picked causes), so only fetch when signed in and the caller marks
// the tab reachable. Keyed by user since each action carries the visitor's own
// completion state.
export const useContributionActions = (
  enabled: boolean,
): UseContributionActions => {
  const { isAuthReady, user } = useAuthContext();
  const shouldFetch = isAuthReady && !!user && enabled;

  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.ContributionActions, user),
    queryFn: async () => {
      const res = await gqlClient.request<{
        contributionActions: Connection<ContributionAction>;
        contributionActionCategories: Connection<ContributionActionCategory>;
      }>(CONTRIBUTION_ACTIONS_QUERY, { first: MAX_ACTIONS });

      return {
        actions: res.contributionActions.edges.map((edge) => edge.node),
        categories: res.contributionActionCategories.edges.map(
          (edge) => edge.node,
        ),
      };
    },
    enabled: shouldFetch,
    staleTime: StaleTime.Default,
    ...disabledRefetch,
  });

  return {
    actions: data?.actions ?? [],
    categories: data?.categories ?? [],
    isPending: shouldFetch && isPending,
  };
};
