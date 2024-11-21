import { useCallback, useMemo, useState } from 'react';
import { useActiveFeedNameContext } from '../../contexts';
import { useMutationSubscription } from '../mutationSubscription';
import {
  UseVoteMutationProps,
  UserVoteEntity,
  createVoteMutationKey,
} from '../vote';
import { Post, UserVote } from '../../graphql/posts';

interface UsePostShareLoop {
  shouldShowOverlay: boolean;
  onInteract: () => void;
  currentInteraction: 'upvote' | 'bookmark' | null;
}

export const usePostShareLoop = (post: Post): UsePostShareLoop => {
  const { feedName } = useActiveFeedNameContext();
  const [justUpvoted, setJustUpvoted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const shouldShowOverlay = justUpvoted && !hasInteracted;
  const [isBookmarked, setIsBookmarked] = useState(false);
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

  useMemo(() => {
    const bookmarked = post?.bookmarked;
    setIsBookmarked(!!bookmarked);
    if (bookmarked) {
      setLastInteraction('bookmark');
    }
  }, [post?.bookmarked]);

  const currentInteraction = useMemo(() => {
    if (justUpvoted && isBookmarked) {
      return lastInteraction;
    }
    if (justUpvoted) return 'upvote';
    if (isBookmarked) return 'bookmark';
    return null;
  }, [justUpvoted, isBookmarked, lastInteraction]);

  return {
    shouldShowOverlay,
    onInteract: useCallback(() => setHasInteracted(true), []),
    currentInteraction,
  };
};
