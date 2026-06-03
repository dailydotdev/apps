import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import type { FeedItem, UpdateFeedPost } from '../useFeed';
import { feedLogExtra } from '../../lib/feed';
import type { Origin } from '../../lib/log';
import { useMutationSubscription } from '../mutationSubscription/useMutationSubscription';
import type { UseVotePost, UseVoteMutationProps } from './types';
import { voteMutationMatcher, voteMutationHandlers } from './types';
import { useVotePost } from './useVotePost';
import { mutateVoteFeedPost } from './utils';
import { updatePostCache } from '../../lib/query';
import { useEngagementAdsContext } from '../../contexts/EngagementAdsContext';

export type UseFeedVotePostProps = {
  feedName: string;
  ranking: string;
  items: FeedItem[];
  updatePost: UpdateFeedPost;
  feedQueryKey?: QueryKey;
};

export type UseFeedVotePost = UseVotePost;

export const useFeedVotePost = ({
  feedName,
  ranking,
  items,
  updatePost,
  feedQueryKey,
}: UseFeedVotePostProps): UseFeedVotePost => {
  const queryClient = useQueryClient();
  const { getCreativeForTags } = useEngagementAdsContext();

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
        queryClient,
        feedQueryKey,
      });
    },
  });

  const { toggleUpvote, toggleDownvote, ...restVotePost } = useVotePost({
    variables: { feedName },
    onMutate: ({ id, vote }) => {
      const mutationHandler = voteMutationHandlers[vote];
      updatePostCache(queryClient, id, mutationHandler);
      return mutateVoteFeedPost({
        id,
        vote,
        items,
        updatePost,
        queryClient,
        feedQueryKey,
      });
    },
  });

  return {
    ...restVotePost,
    toggleUpvote: useCallback(
      ({ payload, origin, opts }) => {
        const creative = getCreativeForTags(payload?.tags || []);
        const logExtra = feedLogExtra(feedName, ranking, {
          ...opts?.extra,
          ...(creative && { gen_id: creative.genId }),
        });

        return toggleUpvote({
          payload,
          origin: origin || (logExtra.extra.origin as Origin),
          opts: {
            ...opts,
            ...logExtra,
          },
        });
      },
      [toggleUpvote, feedName, ranking, getCreativeForTags],
    ),
    toggleDownvote: useCallback(
      ({ payload, origin, opts }) => {
        const creative = getCreativeForTags(payload?.tags || []);
        const logExtra = feedLogExtra(feedName, ranking, {
          ...opts?.extra,
          ...(creative && { gen_id: creative.genId }),
        });

        return toggleDownvote({
          payload,
          origin: origin || (logExtra.extra.origin as Origin),
          opts: {
            ...opts,
            ...logExtra,
          },
        });
      },
      [toggleDownvote, feedName, ranking, getCreativeForTags],
    ),
  };
};
