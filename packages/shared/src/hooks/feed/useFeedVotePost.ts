import { requestIdleCallback } from 'next/dist/client/request-idle-callback';
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
import { postEventName } from '../../components/utilities';
import { AuthTriggers } from '../../lib/auth';

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
  setShowCommentPopupId: (postId: string) => void,
  columns: number,
  feedName: string,
  ranking?: string,
): UseFeedVotePost {
  const queryClient = useQueryClient();
  const { user, showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);

  const { upvotePost, cancelPostUpvote } = useVotePost<UseFeedVotePostProps>({
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
      trackEvent(
        postAnalyticsEvent(postEventName({ upvoted }), post, {
          columns,
          column,
          row,
          ...feedAnalyticsExtra(feedName, ranking),
        }),
      );
      if (upvoted) {
        await upvotePost({ id: post.id, index });
        if (setShowCommentPopupId) {
          requestIdleCallback(() => {
            setShowCommentPopupId(post.id);
          });
        }
      } else {
        await cancelPostUpvote({ id: post.id, index });
      }
    },
  };
}
