import { RequestKey } from '../../lib/query';
import { useMutationSubscription } from '../mutationSubscription';
import {
  contentPreferenceMutationMatcher,
  mutationKeyToContentPreferenceStatusMap,
} from '../contentPreference/types';
import { PublicProfile } from '../../lib/user';

type UseProfileContentPreferenceMutationSubscriptionProps = {
  queryKey: unknown[];
};

type UseProfileContentPreferenceMutationSubscription = ReturnType<
  typeof useMutationSubscription
>;

export const useProfileContentPreferenceMutationSubscription = ({
  queryKey,
}: UseProfileContentPreferenceMutationSubscriptionProps): UseProfileContentPreferenceMutationSubscription => {
  return useMutationSubscription({
    matcher: contentPreferenceMutationMatcher,
    callback: ({ mutation, queryClient: mutationQueryClient }) => {
      const currentData = mutationQueryClient.getQueryData(queryKey);
      const [requestKey] = mutation.options.mutationKey as [
        RequestKey,
        ...unknown[],
      ];

      if (!currentData) {
        return;
      }

      const nextStatus = mutationKeyToContentPreferenceStatusMap[requestKey];

      mutationQueryClient.setQueryData<PublicProfile>(queryKey, (data) => {
        return {
          ...data,
          contentPreference: nextStatus
            ? {
                ...data.contentPreference,
                status: nextStatus,
              }
            : undefined,
        };
      });
    },
  });
};
