import { useMutation } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type {
  CreatePostInMultipleSourcesArgs,
  CreatePostInMultipleSourcesResponse,
} from '../../../graphql/posts';
import { createPostInMultipleSources, PostType } from '../../../graphql/posts';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { usePrompt } from '../../../hooks/usePrompt';
import type { ApiErrorResult } from '../../../graphql/common';
import { labels } from '../../../lib';
import { useLogPostCreated } from '../../../hooks/post/useLogPostCreated';

interface UseMultipleSourcePostProps {
  onError?: (error: ApiErrorResult) => void;
  onSuccess?: (data: CreatePostInMultipleSourcesResponse) => void;
}

export type CreationInMultipleSourcesResult = ReturnType<
  typeof createPostInMultipleSources
>;

interface UseMultipleSourcePost {
  isPending: boolean;
  onCreate: (
    args: CreatePostInMultipleSourcesArgs,
  ) => Promise<null | CreationInMultipleSourcesResult>;
}

const getPostType = (args: CreatePostInMultipleSourcesArgs): PostType => {
  if (args.options?.length) {
    return PostType.Poll;
  }

  if (args.externalLink || args.sharedPostId) {
    return PostType.Share;
  }

  return PostType.Freeform;
};

const getTargetType = (
  item: CreatePostInMultipleSourcesResponse[number] | undefined,
): string | undefined => {
  if (!item) {
    return undefined;
  }

  if (item.type === 'moderationItem') {
    return 'moderation_item';
  }

  return 'post';
};

export const useMultipleSourcePost = ({
  onSuccess,
  onError,
}: UseMultipleSourcePostProps): UseMultipleSourcePost => {
  const { isActionsFetched, checkHasCompleted, completeAction } = useActions();
  const { showPrompt } = usePrompt();
  const logPostCreated = useLogPostCreated();

  const hasSeenOpenSquadWarning = useMemo(
    () =>
      isActionsFetched &&
      checkHasCompleted(ActionType.UserPostInOpenSquadWarningSeen),
    [isActionsFetched, checkHasCompleted],
  );

  const { mutateAsync: requestPostCreation, isPending } = useMutation({
    mutationFn: createPostInMultipleSources,
    onSuccess: (data, args) => {
      const firstItem = data[0];
      const moderationCount = data.filter(
        (item) => item.type === 'moderationItem',
      ).length;

      logPostCreated({
        postId: firstItem?.id,
        postType: getPostType(args),
        sourceCount: args.sourceIds.length,
        moderationCount,
        targetType: getTargetType(firstItem),
      });
      onSuccess?.(data);
    },
    onError,
  });

  const onCreate = useCallback(
    async (
      args: CreatePostInMultipleSourcesArgs,
    ): Promise<null | CreationInMultipleSourcesResult> => {
      if (!hasSeenOpenSquadWarning) {
        const confirm = await showPrompt({
          title: 'Posting in an Open Squad',
          description: labels.postCreation.warnings.spammyPosts,
          okButton: { title: 'Post anyway' },
          cancelButton: { title: 'Cancel' },
        });

        await completeAction(ActionType.UserPostInOpenSquadWarningSeen);

        if (!confirm) {
          return null;
        }
      }

      return await requestPostCreation(args);
    },
    [completeAction, hasSeenOpenSquadWarning, requestPostCreation, showPrompt],
  );

  return { onCreate, isPending };
};
