import { useContext, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import {
  useVotePost,
  cancelUpvotePostMutationKey,
  upvotePostMutationKey,
  downvotePostMutationKey,
  cancelDownvotePostMutationKey,
  mutationHandlers,
} from '../useVotePost';
import { FeedItem } from '../useFeed';
import { Post } from '../../graphql/posts';
import AuthContext from '../../contexts/AuthContext';
import {
  feedAnalyticsExtra,
  optimisticPostUpdateInFeed,
  postAnalyticsEvent,
} from '../../lib/feed';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AuthTriggers } from '../../lib/auth';
import { AnalyticsEvent } from '../../lib/analytics';

export type UseFeedVotePostProps = {
  id: string;
  index: number;
};

export type UseFeedVotePost = {
  onUpvote: (
    post: Post,
    index: number,
    row: number,
    column: number,
    upvoted: boolean,
  ) => Promise<void>;
  onDownvote: (
    post: Post,
    index: number,
    row: number,
    column: number,
    downvoted: boolean,
  ) => Promise<void>;
};

const upvotePostKey = upvotePostMutationKey.toString();
const cancelUpvotePostKey = cancelUpvotePostMutationKey.toString();
const downvotePostKey = downvotePostMutationKey.toString();
const cancelDownvotePostKey = cancelDownvotePostMutationKey.toString();
const mutationKeyToHandlerMap = {
  [upvotePostKey]: mutationHandlers.upvote,
  [cancelUpvotePostKey]: mutationHandlers.cancelUpvote,
  [downvotePostKey]: mutationHandlers.downvote,
  [cancelDownvotePostKey]: mutationHandlers.cancelDownvote,
};

export default function useFeedVotePost(
  items: FeedItem[],
  updatePost: (page: number, index: number, post: Post) => void,
  columns: number,
  feedName: string,
  ranking?: string,
): UseFeedVotePost {
  const queryClient = useQueryClient();
  const { user, showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);

  const { upvotePost, cancelPostUpvote, downvotePost, cancelPostDownvote } =
    useVotePost<UseFeedVotePostProps>({
      onUpvotePostMutate: optimisticPostUpdateInFeed(
        items,
        updatePost,
        mutationHandlers.upvote,
      ),
      onCancelPostUpvoteMutate: optimisticPostUpdateInFeed(
        items,
        updatePost,
        mutationHandlers.cancelUpvote,
      ),
      onDownvotePostMutate: optimisticPostUpdateInFeed(
        items,
        updatePost,
        mutationHandlers.downvote,
      ),
      onCancelPostDownvoteMutate: optimisticPostUpdateInFeed(
        items,
        updatePost,
        mutationHandlers.cancelDownvote,
      ),
    });

  useEffect(() => {
    const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
      if (event.state.status !== 'success') {
        return;
      }

      const mutationKey = event.options.mutationKey?.toString();

      const mutationHandler = mutationKeyToHandlerMap[mutationKey];

      if (!mutationHandler) {
        return;
      }

      const variables = event.options
        .variables as unknown as UseFeedVotePostProps;

      if (!variables) {
        return;
      }

      const { id, index: indexFromEvent } = variables;

      const mutationFromFeedHook = typeof indexFromEvent !== 'undefined';

      if (mutationFromFeedHook) {
        return;
      }

      const index = items.findIndex(
        (item) => item.type === 'post' && item.post.id === id,
      );

      if (index === -1) {
        return;
      }

      optimisticPostUpdateInFeed(items, updatePost, mutationHandler)({ index });
    });

    return () => {
      unsubscribe();
    };
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, updatePost]);

  return {
    onUpvote: async (post, index, row, column, upvoted): Promise<void> => {
      if (!user) {
        showLogin(AuthTriggers.Upvote);
        return;
      }

      if (upvoted) {
        trackEvent(
          postAnalyticsEvent(AnalyticsEvent.UpvotePost, post, {
            columns,
            column,
            row,
            ...feedAnalyticsExtra(feedName, ranking),
          }),
        );
        await upvotePost({ id: post.id, index });
      } else {
        trackEvent(
          postAnalyticsEvent(AnalyticsEvent.RemovePostUpvote, post, {
            columns,
            column,
            row,
            ...feedAnalyticsExtra(feedName, ranking),
          }),
        );
        await cancelPostUpvote({ id: post.id, index });
      }
    },
    onDownvote: async (post, index, row, column, downvoted): Promise<void> => {
      if (!user) {
        showLogin(AuthTriggers.Downvote);
        return;
      }

      if (downvoted) {
        trackEvent(
          postAnalyticsEvent(AnalyticsEvent.DownvotePost, post, {
            columns,
            column,
            row,
            ...feedAnalyticsExtra(feedName, ranking),
          }),
        );
        await downvotePost({ id: post.id, index });
      } else {
        trackEvent(
          postAnalyticsEvent(AnalyticsEvent.RemovePostDownvote, post, {
            columns,
            column,
            row,
            ...feedAnalyticsExtra(feedName, ranking),
          }),
        );
        await cancelPostDownvote({ id: post.id, index });
      }
    },
  };
}
