import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type { Post } from '../../graphql/posts';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { disabledRefetch } from '../../lib/func';

type Interaction = 'upvote' | 'bookmark' | 'copy' | 'none';

type PostActionData = {
  interaction: Interaction;
  previousInteraction: Interaction;
};

type UsePostActions = PostActionData & {
  onInteract: (interaction: PostActionData['interaction']) => void;
};

const defaultPostActionData: PostActionData = {
  interaction: 'none',
  previousInteraction: 'none',
};

export const usePostActions = ({ post }: { post?: Post }): UsePostActions => {
  const client = useQueryClient();
  const postId = post?.id;
  const key = useMemo(() => {
    if (!postId) {
      return [RequestKey.PostActions, 'missing-post'];
    }

    return generateQueryKey(RequestKey.PostActions, { id: postId });
  }, [postId]);

  const queryFn = useCallback((): PostActionData => {
    return defaultPostActionData;
  }, []);

  const { data } = useQuery({
    queryKey: key,
    queryFn,
    initialData: queryFn,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!postId,
    ...disabledRefetch,
  });
  const actionData = data ?? queryFn();

  const onInteract = useCallback(
    (interaction: PostActionData['interaction']) => {
      if (!postId) {
        return;
      }

      client.setQueryData<PostActionData>(key, {
        interaction,
        previousInteraction:
          actionData.interaction === interaction
            ? 'none'
            : actionData.interaction,
      });
    },
    [client, key, actionData.interaction, postId],
  );

  return {
    interaction: actionData.interaction,
    previousInteraction: actionData.previousInteraction,
    onInteract,
  };
};

/**
 * Record an upvote the way the feed cards do, for the post page's own action
 * bars.
 *
 * Surfaces that fire off the back of an upvote — `PostContentShare` — read this
 * interaction, not `post.userState.vote`. Only `useCardActions` used to set it,
 * so upvoting anywhere on the post page left it empty and those surfaces never
 * appeared. Every post-page bar that owns an upvote button has to call this:
 * `PostActions`, `FocusCardActionBar`, and both `MobilePostFloatingBar`s.
 *
 * Deliberately not folded into `useVotePost`. That would fire for feed-card
 * upvotes too, and `useCardCover` turns `interaction === 'upvote'` into a share
 * overlay on the card — so an upvote from the post page would leave an overlay
 * waiting back in the feed.
 */
export const useRecordUpvoteInteraction = ({
  post,
}: {
  post?: Post;
}): ((isUpvoteActive: boolean) => void) => {
  const { onInteract } = usePostActions({ post });

  return useCallback(
    (isUpvoteActive: boolean) => onInteract(isUpvoteActive ? 'none' : 'upvote'),
    [onInteract],
  );
};
