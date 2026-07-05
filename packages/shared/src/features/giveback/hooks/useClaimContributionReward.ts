import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { gqlClient } from '../../../graphql/common';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { CLAIM_CONTRIBUTION_REWARD_MUTATION } from '../graphql';

interface UseClaimContributionReward {
  claim: (tierId: string) => Promise<void>;
  isPending: boolean;
}

export const useClaimContributionReward = (): UseClaimContributionReward => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (tierId: string) => {
      await gqlClient.request(CLAIM_CONTRIBUTION_REWARD_MUTATION, { tierId });
    },
    onSuccess: () => {
      // Claimed state lives in the shared catalog query (see
      // `useContributionActions`), so refresh that to mark the node claimed.
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.ContributionActions, user),
      });
    },
  });

  return { claim: mutateAsync, isPending };
};
