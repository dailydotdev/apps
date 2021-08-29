import { requestIdleCallback } from 'next/dist/client/request-idle-callback';
import { useContext } from 'react';
import useUpvotePost from '../useUpvotePost';
import { FeedItem } from '../useFeed';
import { Post } from '../../graphql/posts';
import { LoginModalMode } from '../../types/LoginModalMode';
import { trackEvent } from '../../lib/analytics';
import AuthContext from '../../contexts/AuthContext';
import { optimisticPostUpdateInFeed } from '../../lib/feed';

export default function useFeedUpvotePost(
  items: FeedItem[],
  updatePost: (page: number, index: number, post: Post) => void,
  setShowCommentPopupId: (postId: string) => void,
): (post: Post, index: number, upvoted: boolean) => Promise<void> {
  const { user, showLogin } = useContext(AuthContext);

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

  return async (post: Post, index: number, upvoted: boolean): Promise<void> => {
    if (!user) {
      showLogin('upvote', LoginModalMode.ContentQuality);
      return;
    }
    trackEvent({
      category: 'Post',
      action: 'Upvote',
      label: upvoted ? 'Add' : 'Remove',
    });
    if (upvoted) {
      await upvotePost({ id: post.id, index });
      requestIdleCallback(() => {
        setShowCommentPopupId(post.id);
      });
    } else {
      await cancelPostUpvote({ id: post.id, index });
    }
  };
}
