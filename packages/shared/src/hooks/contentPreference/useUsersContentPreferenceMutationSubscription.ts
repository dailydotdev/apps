import { InfiniteData, QueryKey } from '@tanstack/react-query';
import { useMutationSubscription } from '../mutationSubscription/useMutationSubscription';
import { RequestKey, updateAuthorContentPreference } from '../../lib/query';
import { PropsParameters } from '../../types';
import {
  contentPreferenceMutationMatcher,
  mutationKeyToContentPreferenceStatusMap,
  ContentPreferenceMutation,
} from './types';

type UseUsersContentPreferenceMutationSubscriptionProps = {
  queryKey: QueryKey;
  queryProp: string;
};

type UseUsersContentPreferenceMutationSubscription = ReturnType<
  typeof useMutationSubscription
>;

export const useUsersContentPreferenceMutationSubscription = ({
  queryKey,
  queryProp,
}: UseUsersContentPreferenceMutationSubscriptionProps): UseUsersContentPreferenceMutationSubscription => {
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

      mutationQueryClient.setQueryData<InfiniteData<unknown>>(
        queryKey,
        (data) => {
          const newData = {
            ...data,
            pages: data.pages?.map((page) => {
              return {
                [queryProp]: {
                  ...page[queryProp],
                  edges: page[queryProp].edges?.map((edge) => {
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
