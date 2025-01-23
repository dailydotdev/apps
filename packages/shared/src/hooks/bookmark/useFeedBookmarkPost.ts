import { useCallback } from 'react';
import type { MutationKey } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import type { FeedItem, UpdateFeedPost } from '../useFeed';
import { feedLogExtra } from '../../lib/feed';
import type { Origin } from '../../lib/log';
import { useMutationSubscription } from '../mutationSubscription/useMutationSubscription';
import type { UseBookmarkPost } from '../useBookmarkPost';
import { mutateBookmarkFeedPost, useBookmarkPost } from '../useBookmarkPost';
import type { UseBookmarkMutationProps } from './types';
import { bookmarkMutationMatcher } from './types';
import { updatePostCache } from '../../lib/query';

export type UseFeedBookmarkPost = {
  feedName: string;
  feedQueryKey: MutationKey;
  ranking: string;
  items: FeedItem[];
  updatePost: UpdateFeedPost;
};

export const useFeedBookmarkPost = ({
  feedName,
  feedQueryKey,
  ranking,
  items,
  updatePost,
}: UseFeedBookmarkPost): UseBookmarkPost => {
  const queryClient = useQueryClient();

  useMutationSubscription({
    matcher: bookmarkMutationMatcher,
    callback: ({ variables: mutationVariables }) => {
      if (!mutationVariables || !items) {
        return;
      }

      mutateBookmarkFeedPost({
        ...(mutationVariables as UseBookmarkMutationProps),
        items,
        updatePost,
      });
    },
  });

  const { toggleBookmark } = useBookmarkPost({
    mutationKey: feedQueryKey,
    onMutate: ({ id }) => {
      updatePostCache(queryClient, id, (post) => ({
        bookmarked: !post.bookmarked,
      }));
      return mutateBookmarkFeedPost({
        id,
        items,
        updatePost,
      });
    },
  });

  return {
    toggleBookmark: useCallback(
      ({ post, origin, opts }) => {
        const logExtra = feedLogExtra(feedName, ranking);
        return toggleBookmark({
          post,
          origin: origin || (logExtra.extra.origin as Origin),
          opts: {
            ...opts,
            ...logExtra,
          },
        });
      },
      [feedName, ranking, toggleBookmark],
    ),
  };
};
