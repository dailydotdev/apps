import { InfiniteData } from '@tanstack/react-query';
import { FeedData } from '../../graphql/posts';
import {
  ContentPreferenceMutation,
  contentPreferenceMutationMatcher,
  mutationKeyToContentPreferenceStatusMap,
} from '../../hooks/contentPreference/types';
import { useMutationSubscription } from '../../hooks/mutationSubscription/useMutationSubscription';
import { RequestKey, updatePostContentPreference } from '../../lib/query';
import { PropsParameters } from '../../types';

type UseFeedContentPreferenceMutationSubscriptionProps = {
  feedQueryKey: unknown[];
};

type UseFeedContentPreferenceMutationSubscription = ReturnType<
  typeof useMutationSubscription
>;

export const useFeedContentPreferenceMutationSubscription = ({
  feedQueryKey,
}: UseFeedContentPreferenceMutationSubscriptionProps): UseFeedContentPreferenceMutationSubscription => {
  return useMutationSubscription({
    matcher: contentPreferenceMutationMatcher,
    callback: ({
      mutation,
      variables: mutationVariables,
      queryClient: mutationQueryClient,
    }) => {
      const currentData = mutationQueryClient.getQueryData(feedQueryKey);
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

      mutationQueryClient.setQueryData<InfiniteData<FeedData>>(
        feedQueryKey,
        (data) => {
          const newFeedData = {
            ...data,
            pages: data.pages?.map((feedPage) => {
              return {
                page: {
                  ...feedPage.page,
                  edges: feedPage.page.edges?.map((edge) => {
                    const newPostData = updatePostContentPreference({
                      data: edge.node,
                      status: nextStatus,
                      entityId,
                      entity,
                    });

                    return {
                      ...edge,
                      node: newPostData,
                    };
                  }),
                },
              };
            }),
          };

          return newFeedData;
        },
      );
    },
  });
};
