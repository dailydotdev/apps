import { useMutation } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type {
  CreatePostInMultipleSourcesArgs,
  CreatePostInMultipleSourcesResponse,
} from '../../../graphql/posts';
import { createPostInMultipleSources } from '../../../graphql/posts';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { usePrompt } from '../../../hooks/usePrompt';
import type { ApiErrorResult } from '../../../graphql/common';
import { labels } from '../../../lib';

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

export const useMultipleSourcePost = ({
  onSuccess,
  onError,
}: UseMultipleSourcePostProps): UseMultipleSourcePost => {
  const { isActionsFetched, checkHasCompleted, completeAction } = useActions();
  const { showPrompt } = usePrompt();

  const hasSeenOpenSquadWarning = useMemo(
    () =>
      isActionsFetched &&
      checkHasCompleted(ActionType.UserPostInOpenSquadWarningSeen),
    [isActionsFetched, checkHasCompleted],
  );

  const { mutateAsync: requestPostCreation, isPending } = useMutation({
    mutationFn: createPostInMultipleSources,
    onSuccess,
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
