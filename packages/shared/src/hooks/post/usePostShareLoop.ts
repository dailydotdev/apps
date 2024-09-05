import { useCallback, useMemo, useState } from 'react';

import { useActiveFeedNameContext } from '../../contexts';
import { Post, UserVote } from '../../graphql/posts';
import { useMutationSubscription } from '../mutationSubscription';
import {
  createVoteMutationKey,
  UserVoteEntity,
  UseVoteMutationProps,
} from '../vote';

interface UsePostShareLoop {
  shouldShowOverlay: boolean;
  onInteract: () => void;
}

export const usePostShareLoop = (post: Post): UsePostShareLoop => {
  const { feedName } = useActiveFeedNameContext();
  const [justUpvoted, setJustUpvoted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const shouldShowOverlay = justUpvoted && !hasInteracted;
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
    },
  });

  return {
    shouldShowOverlay,
    onInteract: useCallback(() => setHasInteracted(true), []),
  };
};
