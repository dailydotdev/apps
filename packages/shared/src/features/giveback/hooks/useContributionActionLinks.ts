import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { CONTRIBUTION_ACTION_LINKS_QUERY } from '../graphql';
import type { ContributionActionLink } from '../types';

interface UseContributionActionLinksProps {
  actionId: string;
  enabled: boolean;
}

interface UseContributionActionLinks {
  links: ContributionActionLink[];
  isPending: boolean;
  isFetching: boolean;
  shuffle: () => void;
}

// A link_pool action's suggested targets. The backend returns a random handful,
// so refetching (`shuffle`) swaps in a fresh set. staleTime 0 keeps each refetch
// live rather than served from cache.
export const useContributionActionLinks = ({
  actionId,
  enabled,
}: UseContributionActionLinksProps): UseContributionActionLinks => {
  const { user } = useAuthContext();

  const { data, isPending, isFetching, refetch } = useQuery({
    queryKey: generateQueryKey(RequestKey.ContributionActionLinks, user, {
      actionId,
    }),
    queryFn: async () => {
      const res = await gqlClient.request<{
        contributionActionLinks: ContributionActionLink[];
      }>(CONTRIBUTION_ACTION_LINKS_QUERY, { actionId });

      return res.contributionActionLinks;
    },
    enabled,
    staleTime: 0,
    ...disabledRefetch,
  });

  return {
    links: data ?? [],
    isPending: enabled && isPending,
    isFetching,
    shuffle: () => refetch(),
  };
};
