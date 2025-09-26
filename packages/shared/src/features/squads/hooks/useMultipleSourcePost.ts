import { useMutation } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type { CreateMultipleSourcePostsArgs } from '../../../graphql/posts';
import { createMultipleSourcePosts } from '../../../graphql/posts';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { usePrompt } from '../../../hooks/usePrompt';
import { useAuthContext } from '../../../contexts/AuthContext';

export const useMultipleSourcePost = () => {
  const { squads = [], user } = useAuthContext();
  const { isActionsFetched, checkHasCompleted } = useActions();
  const { showPrompt } = usePrompt();

  const hasSeenOpenSquadWarning = useMemo(
    () =>
      isActionsFetched && checkHasCompleted(ActionType.WarningPostOpenSquad),
    [isActionsFetched, checkHasCompleted],
  );

  const sourceOptions = useMemo(() => {
    return {
      squads: squads.map((squad) => ({
        label: squad.name,
        value: squad.id,
      })),
      user: user ? [{ label: user.username, value: user.id }] : [],
    };
  }, [squads, user]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createMultipleSourcePosts,
  });

  const onCreate = useCallback(
    async (args: CreateMultipleSourcePostsArgs) => {
      if (!hasSeenOpenSquadWarning) {
        const confirm = await showPrompt({
          title: 'Posting in an Open Squad',
          description:
            'Irrelevant or spammy posts may be flagged and could lead to lost posting rights.',
          okButton: { title: 'Post anyway' },
          cancelButton: { title: 'Cancel' },
        });

        if (!confirm) {
          return;
        }
      }

      await mutateAsync(args);
    },
    [hasSeenOpenSquadWarning, mutateAsync, showPrompt],
  );

  return { onCreate, isPending, sourceOptions };
};
