import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { CONTRIBUTION_STATUS_QUERY } from '../graphql';
import type { ContributionStatus } from '../types';

interface UseContributionStatus {
  status?: ContributionStatus;
  isPending: boolean;
}

// Public query: campaign-wide numbers come back for everyone, while the
// user-specific fields (`eligible`, `userPoints`) are null until the visitor
// signs in. Keyed by user so signing in/out refetches their own progress.
export const useContributionStatus = (): UseContributionStatus => {
  const { user, isAuthReady } = useAuthContext();

  const { data, isPending } = useQuery({
    queryKey: generateQueryKey(RequestKey.ContributionStatus, user),
    queryFn: async () => {
      const res = await gqlClient.request<{
        contributionStatus: ContributionStatus;
      }>(CONTRIBUTION_STATUS_QUERY);

      return res.contributionStatus;
    },
    enabled: isAuthReady,
    staleTime: StaleTime.Default,
    ...disabledRefetch,
  });

  return { status: data, isPending };
};
