import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import type { FeedData } from '../../graphql/posts';
import type { FeedItemData } from '../../graphql/feed';
import { isFeedApiHighlightItem, isFeedApiPostItem } from '../../graphql/feed';
import type { ContentPreferenceMutation } from '../../hooks/contentPreference/types';
import {
  contentPreferenceMutationMatcher,
  mutationKeyToContentPreferenceStatusMap,
} from '../../hooks/contentPreference/types';
import { useMutationSubscription } from '../../hooks/mutationSubscription/useMutationSubscription';
import type { RequestKey } from '../../lib/query';
import { updatePostContentPreference } from '../../lib/query';

type UseFeedContentPreferenceMutationSubscriptionProps = {
  feedQueryKey: QueryKey;
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

      if (typeof nextStatus === 'undefined') {
        return;
      }

      const { id: entityId, entity } =
        mutationVariables as Parameters<ContentPreferenceMutation>[0];

      mutationQueryClient.setQueryData<InfiniteData<FeedData | FeedItemData>>(
        feedQueryKey,
        (data) => {
          if (!data) {
            return data;
          }

          return {
            ...data,
            pages: data.pages.map((feedPage) => {
              return {
                ...feedPage,
                page: {
                  ...feedPage.page,
                  edges: feedPage.page.edges.map((edge) => {
                    if (isFeedApiPostItem(edge.node)) {
                      return {
                        ...edge,
                        node: {
                          ...edge.node,
                          post: updatePostContentPreference({
                            data: edge.node.post,
                            status: nextStatus,
                            entityId,
                            entity,
                          }),
                        },
                      };
                    }

                    if (isFeedApiHighlightItem(edge.node)) {
                      return edge;
                    }

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
          } as InfiniteData<FeedData | FeedItemData>;
        },
      );
    },
  });
};
