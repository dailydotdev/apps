import { useCallback } from 'react';
import { FeedItem, UpdateFeedPost } from '../useFeed';
import { feedLogExtra } from '../../lib/feed';
import { Origin } from '../../lib/log';
import { useMutationSubscription } from '../mutationSubscription/useMutationSubscription';
import {
  UseVotePost,
  UseVoteMutationProps,
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
    callback: ({ variables: mutationVariables }) => {
      if (!mutationVariables || !items) {
        return;
      }

      mutateVoteFeedPost({
        ...(mutationVariables as UseVoteMutationProps),
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
    toggleUpvote: useCallback(
      ({ payload, origin, opts }) => {
        const logExtra = feedLogExtra(feedName, ranking, opts?.extra);

        return toggleUpvote({
          payload,
          origin: origin || (logExtra.extra.origin as Origin),
          opts: {
            ...opts,
            ...logExtra,
          },
        });
      },
      [toggleUpvote, feedName, ranking],
    ),
    toggleDownvote: useCallback(
      ({ payload, origin, opts }) => {
        const logExtra = feedLogExtra(feedName, ranking, opts?.extra);

        return toggleDownvote({
          payload,
          origin: origin || (logExtra.extra.origin as Origin),
          opts: {
            ...opts,
            ...logExtra,
          },
        });
      },
      [toggleDownvote, feedName, ranking],
    ),
  };
};
