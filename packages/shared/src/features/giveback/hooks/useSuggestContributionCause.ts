import { useMutation } from '@tanstack/react-query';
import { gqlClient } from '../../../graphql/common';
import { SUGGEST_CONTRIBUTION_CAUSE_MUTATION } from '../graphql';

export interface SuggestContributionCauseInput {
  url: string;
  note?: string;
}

interface UseSuggestContributionCause {
  suggest: (input: SuggestContributionCauseInput) => Promise<void>;
  isPending: boolean;
}

// Sends a cause nomination for review. Nothing is stored client- or server-side
// (the backend just pings Slack), so there's no cache to invalidate — the caller
// owns the success/error UI.
export const useSuggestContributionCause = (): UseSuggestContributionCause => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ url, note }: SuggestContributionCauseInput) => {
      await gqlClient.request(SUGGEST_CONTRIBUTION_CAUSE_MUTATION, {
        url,
        note: note || undefined,
      });
    },
  });

  return { suggest: mutateAsync, isPending };
};
