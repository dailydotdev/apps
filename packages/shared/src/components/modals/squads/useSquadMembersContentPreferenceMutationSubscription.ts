import { InfiniteData } from '@tanstack/react-query';
import { useMutationSubscription } from '../../../hooks';
import {
  contentPreferenceMutationMatcher,
  mutationKeyToContentPreferenceStatusMap,
  ContentPreferenceMutation,
} from '../../../hooks/contentPreference/types';
import { RequestKey, updateAuthorContentPreference } from '../../../lib/query';
import { PropsParameters } from '../../../types';
import { SquadEdgesData } from '../../../graphql/squads';

type UseSquadMembersContentPreferenceMutationSubscriptionProps = {
  queryKey: unknown[];
};

type UseSquadMembersContentPreferenceMutationSubscription = ReturnType<
  typeof useMutationSubscription
>;

export const useSquadMembersContentPreferenceMutationSubscription = ({
  queryKey,
}: UseSquadMembersContentPreferenceMutationSubscriptionProps): UseSquadMembersContentPreferenceMutationSubscription => {
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

      const { id: entityId, entity } =
        mutationVariables as PropsParameters<ContentPreferenceMutation>;

      mutationQueryClient.setQueryData<InfiniteData<SquadEdgesData>>(
        queryKey,
        (data) => {
          const newData = {
            ...data,
            pages: data.pages?.map((page) => {
              return {
                sourceMembers: {
                  ...page.sourceMembers,
                  edges: page.sourceMembers.edges?.map((edge) => {
                    if (edge.node.user?.id === entityId) {
                      return {
                        ...edge,
                        node: {
                          ...edge.node,
                          user: {
                            ...edge.node.user,
                            ...updateAuthorContentPreference({
                              data: edge.node.user,
                              entity,
                              status: nextStatus,
                            }),
                          },
                        },
                      };
                    }

                    return edge;
                  }),
                },
              };
            }),
          };

          return newData;
        },
      );
    },
  });
};
