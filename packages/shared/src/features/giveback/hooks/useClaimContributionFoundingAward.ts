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
        // Founding-award state rides on the journey query, so patch that cache
        // entry with the fresh state the mutation returns (no refetch needed).
        const key = generateQueryKey(RequestKey.ContributionActions, user);
        const previous = queryClient.getQueryData<{
          foundingAward?: ContributionFoundingAward;
        }>(key);
        if (!previous) {
          // The roadmap loads the journey query before the claim is reachable;
          // if it's somehow missing, refetch rather than drop the new state.
          queryClient.invalidateQueries({ queryKey: key });
          return;
        }
        queryClient.setQueryData(key, { ...previous, foundingAward });
      },
      onError: (error: ClientError) => {
        displayToast(
          error.response?.errors?.[0]?.message || labels.error.generic,
        );
      },
    });

    return { claim: mutateAsync, isPending };
  };
