import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { useBookmarkPost } from '@dailydotdev/shared/src/hooks/useBookmarkPost';
import { useVotePost } from '@dailydotdev/shared/src/hooks/vote/useVotePost';
import { Origin } from '@dailydotdev/shared/src/lib/log';

type ExplorePostActionCallbacks = {
  onUpvoteClick: (post: Post) => void;
  onDownvoteClick: (post: Post) => Promise<void>;
  onBookmarkClick: (post: Post) => void;
};

const getOptimisticUpvoteState = (post: Post): Partial<Post> => {
  const vote = post.userState?.vote ?? UserVote.None;
  const currentUpvotes = post.numUpvotes ?? 0;

  if (vote === UserVote.Up) {
    return {
      numUpvotes: Math.max(0, currentUpvotes - 1),
      userState: { ...post.userState, vote: UserVote.None },
    };
  }

  return {
    numUpvotes:
      vote === UserVote.Down ? currentUpvotes + 1 : currentUpvotes + 1,
    userState: { ...post.userState, vote: UserVote.Up },
  };
};

const getOptimisticDownvoteState = (post: Post): Partial<Post> => {
  const vote = post.userState?.vote ?? UserVote.None;
  const currentUpvotes = post.numUpvotes ?? 0;

  if (vote === UserVote.Down) {
    return {
      userState: { ...post.userState, vote: UserVote.None },
    };
  }

  if (vote === UserVote.Up) {
    return {
      numUpvotes: Math.max(0, currentUpvotes - 1),
      userState: { ...post.userState, vote: UserVote.Down },
    };
  }

  return {
    userState: { ...post.userState, vote: UserVote.Down },
  };
};

const getOptimisticBookmarkState = (post: Post): Partial<Post> => ({
  bookmarked: !post.bookmarked,
});

export const useExplorePostActionCallbacks = (): ExplorePostActionCallbacks => {
  const queryClient = useQueryClient();
  const { toggleUpvote, toggleDownvote } = useVotePost();
  const { toggleBookmark } = useBookmarkPost();

  const updatePostInExploreCache = useCallback(
    (postId: string, updater: (p: Post) => Partial<Post>) => {
      queryClient.setQueriesData(
        { queryKey: ['explore'] },
        (data: unknown) => {
          if (!data || typeof data !== 'object') {
            return data;
          }

          const feedData = data as { page?: { edges?: Array<{ node?: Post }> } };
          const edges = feedData?.page?.edges;

          if (!edges?.length) {
            return data;
          }

          let changed = false;
          const nextEdges = edges.map((edge) => {
            if (!edge?.node || edge.node.id !== postId) {
              return edge;
            }

            changed = true;
            return { ...edge, node: { ...edge.node, ...updater(edge.node) } };
          });

          if (!changed) {
            return data;
          }

          return { ...feedData, page: { ...feedData.page, edges: nextEdges } };
        },
      );
    },
    [queryClient],
  );

  const onUpvoteClick = useCallback(
    (post: Post) => {
      updatePostInExploreCache(post.id, getOptimisticUpvoteState);
      toggleUpvote({
        payload: post,
        origin: Origin.ExplorePage,
      }).catch(() => null);
    },
    [updatePostInExploreCache, toggleUpvote],
  );

  const onDownvoteClick = useCallback(
    async (post: Post) => {
      updatePostInExploreCache(post.id, getOptimisticDownvoteState);
      await toggleDownvote({
        payload: post,
        origin: Origin.ExplorePage,
      });
    },
    [updatePostInExploreCache, toggleDownvote],
  );

  const onBookmarkClick = useCallback(
    (post: Post) => {
      updatePostInExploreCache(post.id, getOptimisticBookmarkState);
      toggleBookmark({
        post,
        origin: Origin.ExplorePage,
      }).catch(() => null);
    },
    [updatePostInExploreCache, toggleBookmark],
  );

  return {
    onUpvoteClick,
    onDownvoteClick,
    onBookmarkClick,
  };
};
