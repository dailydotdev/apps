import type { Squad } from '../../graphql/sources';
import type { RequestKey } from '../../lib/query';
import type { PropsParameters } from '../../types';
import { useMutationSubscription } from '../mutationSubscription';
import type { ContentPreferenceMutation } from './types';
import {
  contentPreferenceMutationMatcher,
  mutationKeyToContentPreferenceStatusMap,
} from './types';

type UseSourceContentPreferenceMutationSubscriptionProps = {
  queryKey: unknown[];
};

type UseSourceContentPreferenceMutationSubscription = ReturnType<
  typeof useMutationSubscription
>;

export const useSourceContentPreferenceMutationSubscription = ({
  queryKey,
}: UseSourceContentPreferenceMutationSubscriptionProps): UseSourceContentPreferenceMutationSubscription => {
  return useMutationSubscription({
    matcher: contentPreferenceMutationMatcher,
    callback: ({
      mutation,
      variables: mutationVariables,
      queryClient: mutationQueryClient,
    }) => {
      const currentData = mutationQueryClient.getQueryData(queryKey);
      const [requestKey] = mutation.options.mutationKey as [
        RequestKey,
        ...unknown[],
      ];

      if (!currentData) {
        return;
      }

      const nextStatus = mutationKeyToContentPreferenceStatusMap[requestKey];

      const { id: entityId } =
        mutationVariables as PropsParameters<ContentPreferenceMutation>;

      mutationQueryClient.setQueryData<Squad>(queryKey, (data) => {
        const newData = structuredClone(data);

        const followedMember = newData.privilegedMembers?.find(
          (item) => item.user.id === entityId,
        );

        if (followedMember?.user) {
          followedMember.user.contentPreference = nextStatus
            ? {
                ...followedMember.user.contentPreference,
                status: nextStatus,
              }
            : undefined;
        }

        return newData;
      });
    },
  });
};
