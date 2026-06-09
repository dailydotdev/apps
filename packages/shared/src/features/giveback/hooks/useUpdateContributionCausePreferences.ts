import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { gqlClient } from '../../../graphql/common';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { UPDATE_CONTRIBUTION_CAUSE_PREFERENCES_MUTATION } from '../graphql';

interface UseUpdateContributionCausePreferences {
  saveCausePreferences: (causeIds: string[]) => Promise<void>;
  isPending: boolean;
}

export const useUpdateContributionCausePreferences =
  (): UseUpdateContributionCausePreferences => {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
      mutationFn: async (causeIds: string[]) => {
        await gqlClient.request(
          UPDATE_CONTRIBUTION_CAUSE_PREFERENCES_MUTATION,
          { causeIds },
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: generateQueryKey(
            RequestKey.ContributionCausePreferences,
            user,
          ),
        });
      },
    });

    return { saveCausePreferences: mutateAsync, isPending };
  };
