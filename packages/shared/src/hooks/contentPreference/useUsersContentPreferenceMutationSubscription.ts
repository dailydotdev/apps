import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import { useMutationSubscription } from '../mutationSubscription/useMutationSubscription';
import type { RequestKey } from '../../lib/query';
import { updateAuthorContentPreference } from '../../lib/query';
import type { ContentPreferenceMutation } from './types';
import {
  contentPreferenceMutationMatcher,
  mutationKeyToContentPreferenceStatusMap,
} from './types';

type QueryPage = {
  [key: string]: {
    edges?: Array<{
      node: {
        user?: Parameters<typeof updateAuthorContentPreference>[0]['data'];
      };
    }>;
  };
};

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
        mutationVariables as Parameters<ContentPreferenceMutation>[0];

      mutationQueryClient.setQueryData<InfiniteData<QueryPage>>(
        queryKey,
        (data) => {
          if (!data) {
            return data;
          }

          const newData = {
            ...data,
            pages: data.pages?.map((page) => {
              const pageConnection = page[queryProp];

              if (!pageConnection) {
                return page;
              }

              return {
                ...page,
                [queryProp]: {
                  ...pageConnection,
                  edges: pageConnection.edges?.map((edge) => {
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
                              status: nextStatus ?? null,
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
