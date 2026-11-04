import { useCallback, useMemo } from 'react';
import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import type { FeedHeroData } from '../../../graphql/feed';
import type { Post } from '../../../graphql/posts';
import { useMutationSubscription } from '../../../hooks/mutationSubscription/useMutationSubscription';
import { bookmarkMutationMatcher } from '../../../hooks/bookmark/types';
import type { UseBookmarkPost } from '../../../hooks/useBookmarkPost';
import { useBookmarkPost } from '../../../hooks/useBookmarkPost';
import type {
  UseVoteMutationProps,
  UseVotePost,
} from '../../../hooks/vote/types';
import {
  voteMutationHandlers,
  voteMutationMatcher,
} from '../../../hooks/vote/types';
import { useVotePost } from '../../../hooks/vote/useVotePost';
import { updatePostCache } from '../../../lib/query';
import type { Origin } from '../../../lib/log';

type UpdatePost = (post: Post) => Partial<Post>;

/**
 * Where a surface's cards read their posts from and write them back to, so
 * the actions below patch the query those cards actually render.
 */
export interface PostCacheAdapter {
  readPost: (client: QueryClient, id: string) => Post | undefined;
  writePost: (client: QueryClient, id: string, patch: Partial<Post>) => void;
}

const heroPostCache = (queryKey: QueryKey): PostCacheAdapter => ({
  readPost: (client, id) =>
    client
      .getQueryData<FeedHeroData>(queryKey)
      ?.feedHero.posts.find((item) => item.id === id),
  writePost: (client, id, patch) =>
    client.setQueryData<FeedHeroData>(
      queryKey,
      (current) =>
        current && {
          ...current,
          feedHero: {
            ...current.feedHero,
            posts: current.feedHero.posts.map((item) =>
              item.id === id ? { ...item, ...patch } : item,
            ),
          },
        },
    ),
});

/**
 * Vote and bookmark for the hero's cards, patching the hero's own query.
 *
 * The bare hooks only write the single-post cache key, which the hero never
 * reads, so a click succeeded on the server and changed nothing on screen. This
 * is the same treatment the grid gives itself in `useFeedVotePost` and
 * `useFeedBookmarkPost`: an optimistic patch of the query the cards render
 * from, keyed mutations so that patch is not applied a second time when the
 * hero's own subscription sees the mutation succeed, and a subscription so a
 * vote fired elsewhere still lands here. `cache` points it at another query
 * (the widget rail's boosted post); the hero's by default.
 */
export const useFeedHeroPostActions = ({
  queryKey,
  feedName,
  origin,
  cache,
}: {
  queryKey: QueryKey;
  feedName: string;
  origin: Origin;
  cache?: PostCacheAdapter;
}): Pick<UseVotePost, 'toggleUpvote' | 'toggleDownvote'> &
  Pick<UseBookmarkPost, 'toggleBookmark'> => {
  const queryClient = useQueryClient();
  const { readPost, writePost } = useMemo(
    () => cache ?? heroPostCache(queryKey),
    [cache, queryKey],
  );

  const writeHeroPost = useCallback(
    (id: string, patch: Partial<Post>) => writePost(queryClient, id, patch),
    [queryClient, writePost],
  );

  // The rollback restores only the fields this patch touched, on this post.
  // Restoring a whole snapshot would also undo a patch that landed in between —
  // a bookmark on another card while an upvote is still in flight.
  const patchHeroPost = useCallback(
    (id: string, update: UpdatePost): (() => void) | undefined => {
      const post = readPost(queryClient, id);

      if (!post) {
        return undefined;
      }

      const patch = update(post);
      const touched = Object.keys(patch) as (keyof Post)[];
      const before = Object.fromEntries(
        touched.map((key) => [key, post[key]]),
      ) as Partial<Post>;

      writeHeroPost(id, patch);

      return () => writeHeroPost(id, before);
    },
    [queryClient, readPost, writeHeroPost],
  );

  const applyVote = useCallback(
    ({ id, vote }: Pick<UseVoteMutationProps, 'id' | 'vote'>) => {
      const handler = voteMutationHandlers[vote];

      return handler ? patchHeroPost(id, handler) : undefined;
    },
    [patchHeroPost],
  );

  const applyBookmark = useCallback(
    (id: string) =>
      patchHeroPost(id, (post) => ({ bookmarked: !post.bookmarked })),
    [patchHeroPost],
  );

  useMutationSubscription({
    matcher: voteMutationMatcher,
    callback: ({ variables }) => {
      const { id, vote } = (variables ?? {}) as Partial<UseVoteMutationProps>;

      if (id && vote) {
        applyVote({ id, vote });
      }
    },
  });

  useMutationSubscription({
    matcher: bookmarkMutationMatcher,
    callback: ({ variables }) => {
      const { id } = (variables ?? {}) as { id?: string };

      if (id) {
        applyBookmark(id);
      }
    },
  });

  const { toggleUpvote, toggleDownvote } = useVotePost({
    variables: { feedName, origin },
    onMutate: ({ id, vote }) => {
      const handler = voteMutationHandlers[vote];

      if (handler) {
        updatePostCache(queryClient, id, handler);
      }

      return applyVote({ id, vote });
    },
  });

  const { toggleBookmark } = useBookmarkPost({
    mutationKey: queryKey,
    onMutate: ({ id }) => {
      if (!id) {
        return undefined;
      }

      updatePostCache(queryClient, id, (post) => ({
        bookmarked: !post.bookmarked,
      }));

      return applyBookmark(id);
    },
  });

  return {
    toggleUpvote: useCallback(
      ({ payload, origin: clickOrigin, opts }) =>
        toggleUpvote({ payload, origin: clickOrigin ?? origin, opts }),
      [toggleUpvote, origin],
    ),
    toggleDownvote: useCallback(
      ({ payload, origin: clickOrigin, opts }) =>
        toggleDownvote({ payload, origin: clickOrigin ?? origin, opts }),
      [toggleDownvote, origin],
    ),
    toggleBookmark: useCallback(
      ({ post, origin: clickOrigin, opts }) =>
        toggleBookmark({ post, origin: clickOrigin ?? origin, opts }),
      [toggleBookmark, origin],
    ),
  };
};
