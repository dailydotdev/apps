import type { PostCommentsData } from '../../graphql/comments';
import type { ContentPreferenceMutation } from '../../hooks/contentPreference/types';
import {
  contentPreferenceMutationMatcher,
  mutationKeyToContentPreferenceStatusMap,
} from '../../hooks/contentPreference/types';
import { useMutationSubscription } from '../../hooks/mutationSubscription/useMutationSubscription';
import type { RequestKey } from '../../lib/query';
import { updateCommentContentPreference } from '../../lib/query';
import type { PropsParameters } from '../../types';

type UseCommentContentPreferenceMutationSubscriptionProps = {
  queryKey: unknown[];
};

type UseCommentContentPreferenceMutationSubscription = ReturnType<
  typeof useMutationSubscription
>;

export const useCommentContentPreferenceMutationSubscription = ({
  queryKey,
}: UseCommentContentPreferenceMutationSubscriptionProps): UseCommentContentPreferenceMutationSubscription => {
  return useMutationSubscription({
    matcher: contentPreferenceMutationMatcher,
    callback: ({
      mutation,
      variables: mutationVariables,
      queryClient: mutationQueryClient,
    }) => {
      const currentData =
        mutationQueryClient.getQueryData<PostCommentsData>(queryKey);
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

      mutationQueryClient.setQueryData<PostCommentsData>(queryKey, (data) => {
        const newCommentsData = {
          ...data,
          postComments: {
            ...data.postComments,
            edges: data.postComments.edges.map((edge) => {
              const newPostData = updateCommentContentPreference({
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

        return newCommentsData;
      });
    },
  });
};
