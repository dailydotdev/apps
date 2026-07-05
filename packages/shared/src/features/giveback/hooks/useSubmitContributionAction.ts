import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { gqlClient } from '../../../graphql/common';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { SUBMIT_CONTRIBUTION_ACTION_MUTATION } from '../graphql';
import type { ContributionSubmission } from '../types';

// Proof the contributor attaches to an action. Each field is only sent when the
// action asks for it; the backend validates which are required.
export interface ContributionActionEvidenceInput {
  url?: string;
  screenshotUrl?: string;
  note?: string;
}

interface UseSubmitContributionAction {
  submit: (input: {
    actionId: string;
    evidence: ContributionActionEvidenceInput;
  }) => Promise<ContributionSubmission>;
  isPending: boolean;
}

export const useSubmitContributionAction = (): UseSubmitContributionAction => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (input: {
      actionId: string;
      evidence: ContributionActionEvidenceInput;
    }) => {
      const res = await gqlClient.request<{
        submitContributionAction: ContributionSubmission;
      }>(SUBMIT_CONTRIBUTION_ACTION_MUTATION, { input });

      return res.submitContributionAction;
    },
    onSuccess: () => {
      // Refresh the card's own state and the campaign totals the submission
      // moved.
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.ContributionActions, user),
      });
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.ContributionOverview, user),
      });
    },
  });

  return { submit: mutateAsync, isPending };
};
