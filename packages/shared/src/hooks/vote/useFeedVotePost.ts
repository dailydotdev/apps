import { FeedItem, UpdateFeedPost } from '../useFeed';
import { feedAnalyticsExtra } from '../../lib/feed';
import { Origin } from '../../lib/analytics';
import { useMutationSubscription } from '../mutationSubscription/useMutationSubscription';
import {
  UseVotePost,
  UseVotePostMutationProps,
  voteMutationMatcher,
} from './types';
import { useVotePost } from './useVotePost';
import { mutateVoteFeedPost } from './utils';

export type UseFeedVotePostProps = {
  feedName: string;
  ranking: string;
  items: FeedItem[];
  updatePost: UpdateFeedPost;
};

export type UseFeedVotePost = UseVotePost;

export const useFeedVotePost = ({
  feedName,
  ranking,
  items,
  updatePost,
}: UseFeedVotePostProps): UseFeedVotePost => {
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
};
