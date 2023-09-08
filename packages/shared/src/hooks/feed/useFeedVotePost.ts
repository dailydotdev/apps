import {
  UseVotePost,
  useVotePost,
  UseVotePostMutationProps,
  UseVotePostProps,
  voteMutationHandlers,
  voteMutationMatcher,
} from '../useVotePost';
import { FeedItem, UpdateFeedPost } from '../useFeed';
import { PostItem } from '../../graphql/posts';
import { feedAnalyticsExtra, optimisticPostUpdateInFeed } from '../../lib/feed';
import { Origin } from '../../lib/analytics';
import { useMutationSubscription } from '../mutationSubscription/useMutationSubscription';

export type UseFeedVotePostProps = {
  feedName: string;
  ranking: string;
  items: FeedItem[];
  updatePost: UpdateFeedPost;
};

export type UseFeedVotePost = UseVotePost;

const mutateVoteFeedPost = ({
  id,
  vote,
  items,
  updatePost,
}: UseVotePostMutationProps & {
  items: FeedItem[];
  updatePost: UpdateFeedPost;
}): ReturnType<UseVotePostProps['onMutate']> => {
  if (!items) {
    return undefined;
  }

  const mutationHandler = voteMutationHandlers[vote];

  if (!mutationHandler) {
    return undefined;
  }

  const postIndexToUpdate = items.findIndex(
    (item) => item.type === 'post' && item.post.id === id,
  );

  if (postIndexToUpdate === -1) {
    return undefined;
  }

  const previousVote = (items[postIndexToUpdate] as PostItem)?.post?.userState
    ?.vote;

  optimisticPostUpdateInFeed(
    items,
    updatePost,
    mutationHandler,
  )({ index: postIndexToUpdate });

  return () => {
    const postIndexToRollback = items.findIndex(
      (item) => item.type === 'post' && item.post.id === id,
    );

    if (postIndexToRollback === -1) {
      return;
    }

    const rollbackMutationHandler = voteMutationHandlers[previousVote];

    if (!rollbackMutationHandler) {
      return;
    }

    optimisticPostUpdateInFeed(
      items,
      updatePost,
      rollbackMutationHandler,
    )({ index: postIndexToUpdate });
  };
};

export default function useFeedVotePost({
  feedName,
  ranking,
  items,
  updatePost,
}: UseFeedVotePostProps): UseFeedVotePost {
  useMutationSubscription({
    matcher: voteMutationMatcher,
    callback: ({ mutation }) => {
      const mutationVariables = mutation.options
        .variables as unknown as UseVotePostMutationProps;

      if (!mutationVariables || !items) {
        return;
      }

      mutateVoteFeedPost({
        ...mutationVariables,
        items,
        updatePost,
      });
    },
  });

  const { toggleUpvote, toggleDownvote, ...restVotePost } = useVotePost({
    variables: { feedName },
    onMutate: ({ id, vote }) => {
      return mutateVoteFeedPost({
        id,
        vote,
        items,
        updatePost,
      });
    },
  });

  return {
    ...restVotePost,
    toggleUpvote: ({ post, origin, opts }) => {
      const analyticsExtra = feedAnalyticsExtra(feedName, ranking);

      return toggleUpvote({
        post,
        origin: origin || (analyticsExtra.extra.origin as Origin),
        opts: {
          ...opts,
          ...analyticsExtra,
        },
      });
    },
    toggleDownvote: ({ post, origin, opts }) => {
      const analyticsExtra = feedAnalyticsExtra(feedName, ranking);

      return toggleDownvote({
        post,
        origin: origin || (analyticsExtra.extra.origin as Origin),
        opts: {
          ...opts,
          ...analyticsExtra,
        },
      });
    },
  };
}
