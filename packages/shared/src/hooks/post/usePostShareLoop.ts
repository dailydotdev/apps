import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useActiveFeedNameContext } from '../../contexts';
import { useMutationSubscription } from '../mutationSubscription';
import type { UseVoteMutationProps } from '../vote';
import { UserVoteEntity, createVoteMutationKey } from '../vote';
import type { Post } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import { useBookmarkReminderCover } from '../bookmark/useBookmarkReminderCover';
import { useAuthContext } from '../../contexts/AuthContext';
import { getShortLinkProps } from '../utils/useGetShortUrl';
import { ReferralCampaignKey } from '../referral';

interface UsePostShareLoop {
  shouldShowOverlay: boolean;
  onInteract: () => void;
  currentInteraction: 'upvote' | 'bookmark' | 'copy' | null;
  shouldShowReminder: boolean;
}

export const usePostShareLoop = (post: Post): UsePostShareLoop => {
  const { user } = useAuthContext();
  const { queryKey: linkKey } = getShortLinkProps(
    post.commentsPermalink,
    ReferralCampaignKey.SharePost,
    user,
  );
  const queryClient = useQueryClient();
  const { feedName } = useActiveFeedNameContext();
  const [justUpvoted, setJustUpvoted] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const shouldShowOverlay = justUpvoted && !hasInteracted;
  const shouldShowReminder = useBookmarkReminderCover(post);
  const [lastInteraction, setLastInteraction] = useState<
    'upvote' | 'bookmark' | 'copy' | null
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

  const linkData = queryClient.getQueryData<{
    getShortUrl: string;
  }>(linkKey);

  useEffect(() => {
    if (linkData) {
      setHasCopied(true);
    }
  }, [linkData]);

  useEffect(() => {
    if (shouldShowReminder) {
      setLastInteraction('bookmark');
    }
  }, [shouldShowReminder]);

  const currentInteraction = useMemo(() => {
    if (justUpvoted && shouldShowReminder && hasCopied) {
      return lastInteraction;
    }

    if (justUpvoted) {
      return 'upvote';
    }
    if (shouldShowReminder) {
      return 'bookmark';
    }

    if (hasCopied) {
      return 'copy';
    }
    return null;
  }, [justUpvoted, shouldShowReminder, lastInteraction, hasCopied]);

  return {
    shouldShowOverlay,
    onInteract: useCallback(() => setHasInteracted(true), []),
    currentInteraction,
    shouldShowReminder,
  };
};
