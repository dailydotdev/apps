import { requestIdleCallback } from 'next/dist/client/request-idle-callback';
import { useContext, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import useUpvotePost, {
  cancelUpvotePostMutationKey,
  upvotePostMutationKey,
} from '../useUpvotePost';
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

export type UseFeedUpvotePostVariables = {
  id: string;
  index: number;
};

const upvotePostKey = upvotePostMutationKey.toString();
const cancelUpvotePostKey = cancelUpvotePostMutationKey.toString();
const mutationHandlers = {
  [upvotePostKey]: (post: Post) => ({
    upvoted: true,
    numUpvotes: post.numUpvotes + 1,
  }),
  [cancelUpvotePostKey]: (post: Post) => ({
    upvoted: false,
    numUpvotes: post.numUpvotes - 1,
  }),
};

export default function useFeedUpvotePost(
  items: FeedItem[],
  updatePost: (page: number, index: number, post: Post) => void,
  setShowCommentPopupId: (postId: string) => void,
  columns: number,
  feedName: string,
  ranking?: string,
): (
  post: Post,
  index: number,
  row: number,
  column: number,
  upvoted: boolean,
) => Promise<void> {
  const queryClient = useQueryClient();
  const { user, showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);

  const { upvotePost, cancelPostUpvote } =
    useUpvotePost<UseFeedUpvotePostVariables>({
      onUpvotePostMutate: optimisticPostUpdateInFeed(
        items,
        updatePost,
        mutationHandlers[upvotePostKey],
      ),
      onCancelPostUpvoteMutate: optimisticPostUpdateInFeed(
        items,
        updatePost,
        mutationHandlers[cancelUpvotePostKey],
      ),
    });

  useEffect(() => {
    const matchedMutations = [
      upvotePostMutationKey,
      cancelUpvotePostMutationKey,
    ].map((item) => item.toString());

    const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
      if (event.state.status !== 'success') {
        return;
      }

      const mutationKey = event.options.mutationKey?.toString();

      if (matchedMutations.includes(mutationKey)) {
        const { id, index: indexFromEvent } = event.options
          .variables as unknown as UseFeedUpvotePostVariables;
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

        const mutationHandler = mutationHandlers[mutationKey];

        if (!mutationHandler) {
          return;
        }

        optimisticPostUpdateInFeed(
          items,
          updatePost,
          mutationHandler,
        )({ index });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [items, updatePost]);

  return async (post, index, row, column, upvoted): Promise<void> => {
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
  };
}
