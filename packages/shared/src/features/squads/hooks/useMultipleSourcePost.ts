import { useMutation } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type { CreatePostInMultipleSourcesArgs } from '../../../graphql/posts';
import { createPostInMultipleSources } from '../../../graphql/posts';
import { useActions, useToastNotification } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { usePrompt } from '../../../hooks/usePrompt';

interface UseMultipleSourcePostProps {
  onError?: () => void;
  onSuccess?: () => void;
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
  const { displayToast } = useToastNotification();

  const hasSeenOpenSquadWarning = useMemo(
    () =>
      isActionsFetched &&
      checkHasCompleted(ActionType.UserPostInOpenSquadWarningSeen),
    [isActionsFetched, checkHasCompleted],
  );

  const { mutateAsync: requestPostCreation, isPending } = useMutation({
    mutationFn: createPostInMultipleSources,
    onSuccess: () => {
      displayToast(`✅ Posts created successfully`);
      onSuccess?.();
    },
    onError: () => {
      displayToast(`❌ Failed to create posts`);
      onError?.();
    },
  });

  const onCreate = useCallback(
    async (
      args: CreatePostInMultipleSourcesArgs,
    ): Promise<null | CreationInMultipleSourcesResult> => {
      if (!hasSeenOpenSquadWarning) {
        const confirm = await showPrompt({
          title: 'Posting in an Open Squad',
          description:
            'Irrelevant or spammy posts may be flagged and could lead to lost posting rights.',
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
