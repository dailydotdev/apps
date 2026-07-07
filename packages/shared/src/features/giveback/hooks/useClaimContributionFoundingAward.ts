import type { ClientError } from 'graphql-request';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { gqlClient } from '../../../graphql/common';
import { labels } from '../../../lib/labels';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { CLAIM_CONTRIBUTION_FOUNDING_AWARD_MUTATION } from '../graphql';
import type { ContributionFoundingAward } from '../types';

interface UseClaimContributionFoundingAward {
  claim: () => Promise<ContributionFoundingAward>;
  isPending: boolean;
}

export const useClaimContributionFoundingAward =
  (): UseClaimContributionFoundingAward => {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    const { displayToast } = useToastNotification();

    const { mutateAsync, isPending } = useMutation({
      mutationFn: async () => {
        const res = await gqlClient.request<{
          claimContributionFoundingAward: ContributionFoundingAward;
        }>(CLAIM_CONTRIBUTION_FOUNDING_AWARD_MUTATION);

        return res.claimContributionFoundingAward;
      },
      onSuccess: (foundingAward) => {
        // The mutation already returns the fresh state, so write it straight
        // into the cache instead of triggering a refetch.
        queryClient.setQueryData(
          generateQueryKey(RequestKey.ContributionFoundingAward, user),
          foundingAward,
        );
      },
      onError: (error: ClientError) => {
        displayToast(
          error.response?.errors?.[0]?.message || labels.error.generic,
        );
      },
    });

    return { claim: mutateAsync, isPending };
  };
