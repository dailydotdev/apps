import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { gqlClient } from '../../../graphql/common';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { CLAIM_CONTRIBUTION_REWARD_MUTATION } from '../graphql';
import type { UserContributionReward } from '../types';

interface UseClaimContributionReward {
  claim: (tierId: string) => Promise<UserContributionReward>;
  isPending: boolean;
}

export const useClaimContributionReward = (): UseClaimContributionReward => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (tierId: string) => {
      const res = await gqlClient.request<{
        claimContributionReward: UserContributionReward;
      }>(CLAIM_CONTRIBUTION_REWARD_MUTATION, { tierId });

      return res.claimContributionReward;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.ContributionUserRewards, user),
      });
    },
  });

  return { claim: mutateAsync, isPending };
};
