import { requestIdleCallback } from 'next/dist/client/request-idle-callback';
import { useContext } from 'react';
import useUpvotePost from '../useUpvotePost';
import { FeedItem } from '../useFeed';
import { Post } from '../../graphql/posts';
import AuthContext from '../../contexts/AuthContext';
import {
  postAnalyticsEvent,
  optimisticPostUpdateInFeed,
  feedAnalyticsExtra,
} from '../../lib/feed';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { postEventName } from '../../components/utilities';

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
  const { user, showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);

  const { upvotePost, cancelPostUpvote } = useUpvotePost<{
    id: string;
    index: number;
  }>({
    onUpvotePostMutate: optimisticPostUpdateInFeed(
      items,
      updatePost,
      (post) => ({ upvoted: true, numUpvotes: post.numUpvotes + 1 }),
    ),
    onCancelPostUpvoteMutate: optimisticPostUpdateInFeed(
      items,
      updatePost,
      (post) => ({ upvoted: false, numUpvotes: post.numUpvotes - 1 }),
    ),
  });

  return async (post, index, row, column, upvoted): Promise<void> => {
    if (!user) {
      showLogin('upvote');
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
