import { useCallback, useEffect, useMemo, useState } from 'react';
import { useActiveFeedNameContext } from '../../contexts';
import { useMutationSubscription } from '../mutationSubscription';
import type { UseVoteMutationProps } from '../vote';
import { UserVoteEntity, createVoteMutationKey } from '../vote';
import type { Post } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import { useBookmarkReminderCover } from '../bookmark/useBookmarkReminderCover';

interface UsePostShareLoop {
  shouldShowOverlay: boolean;
  onInteract: () => void;
  currentInteraction: 'upvote' | 'bookmark' | null;
  shouldShowReminder: boolean;
}

export const usePostShareLoop = (post: Post): UsePostShareLoop => {
  const { feedName } = useActiveFeedNameContext();
  const [justUpvoted, setJustUpvoted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const shouldShowOverlay = justUpvoted && !hasInteracted;
  const shouldShowReminder = useBookmarkReminderCover(post);
  const [lastInteraction, setLastInteraction] = useState<
    'upvote' | 'bookmark' | null
  >(null);
  const key = useMemo(
    () =>
      createVoteMutationKey({
        entity: UserVoteEntity.Post,
        variables: { feedName },
      }).toString(),
    [feedName],
  );

  useMutationSubscription({
    matcher: ({ status, mutation }) =>
      status === 'success' &&
      mutation?.options?.mutationKey?.toString() === key,
    callback: ({ variables }) => {
      const vars = variables as UseVoteMutationProps;

      if (vars.id !== post?.id) {
        return;
      }

      setJustUpvoted(vars.vote === UserVote.Up);
      if (vars.vote === UserVote.Up) {
        setLastInteraction('upvote');
      }
    },
  });

  useEffect(() => {
    if (shouldShowReminder) {
      setLastInteraction('bookmark');
    }
  }, [shouldShowReminder]);

  const currentInteraction = useMemo(() => {
    if (justUpvoted && shouldShowReminder) {
      return lastInteraction;
    }
    if (justUpvoted) {
      return 'upvote';
    }
    if (shouldShowReminder) {
      return 'bookmark';
    }
    return null;
  }, [justUpvoted, shouldShowReminder, lastInteraction]);

  return {
    shouldShowOverlay,
    onInteract: useCallback(() => setHasInteracted(true), []),
    currentInteraction,
    shouldShowReminder,
  };
};
