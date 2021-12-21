import React, { ReactElement, useContext } from 'react';
import { Post, PostData } from '@dailydotdev/shared/src/graphql/posts';
import { QuaternaryButton } from '@dailydotdev/shared/src/components/buttons/QuaternaryButton';
import useUpvotePost from '@dailydotdev/shared/src/hooks/useUpvotePost';
import useBookmarkPost from '@dailydotdev/shared/src/hooks/useBookmarkPost';
import UpvoteIcon from '@dailydotdev/shared/icons/upvote.svg';
import CommentIcon from '@dailydotdev/shared/icons/comment.svg';
import BookmarkIcon from '@dailydotdev/shared/icons/bookmark.svg';
import { QueryClient, useQueryClient, QueryKey } from 'react-query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { postAnalyticsEvent } from '@dailydotdev/shared/src/lib/feed';
import { LoginModalMode } from '@dailydotdev/shared/src/types/LoginModalMode';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';

interface PostActionsProps {
  post: Post;
  postQueryKey: QueryKey;
  onComment?: () => unknown;
}

const updatePost =
  (
    queryClient: QueryClient,
    postQueryKey: QueryKey,
    update: (oldPost: PostData) => Partial<Post>,
  ): (() => Promise<() => void>) =>
  async () => {
    await queryClient.cancelQueries(postQueryKey);
    const oldPost = queryClient.getQueryData<PostData>(postQueryKey);
    queryClient.setQueryData<PostData>(postQueryKey, {
      post: {
        ...oldPost.post,
        ...update(oldPost),
      },
    });
    return () => {
      queryClient.setQueryData<PostData>(postQueryKey, oldPost);
    };
  };

const onUpvoteMutation = (
  queryClient: QueryClient,
  postQueryKey: QueryKey,
  upvoted: boolean,
): (() => Promise<() => void>) =>
  updatePost(queryClient, postQueryKey, (oldPost) => ({
    upvoted,
    numUpvotes: oldPost.post.numUpvotes + (upvoted ? 1 : -1),
  }));

const onBookmarkMutation = (
  queryClient: QueryClient,
  postQueryKey: QueryKey,
  bookmarked: boolean,
): (() => Promise<() => void>) =>
  updatePost(queryClient, postQueryKey, () => ({
    bookmarked,
  }));

export function PostActions({
  post,
  postQueryKey,
  onComment,
}: PostActionsProps): ReactElement {
  const queryClient = useQueryClient();
  const { trackEvent } = useContext(AnalyticsContext);
  const { user, showLogin } = useContext(AuthContext);
  const { upvotePost, cancelPostUpvote } = useUpvotePost({
    onUpvotePostMutate: onUpvoteMutation(queryClient, postQueryKey, true),
    onCancelPostUpvoteMutate: onUpvoteMutation(
      queryClient,
      postQueryKey,
      false,
    ),
  });

  const { bookmark, removeBookmark } = useBookmarkPost({
    onBookmarkMutate: onBookmarkMutation(queryClient, postQueryKey, true),
    onRemoveBookmarkMutate: onBookmarkMutation(
      queryClient,
      postQueryKey,
      false,
    ),
  });

  const toggleUpvote = () => {
    if (user) {
      if (post.upvoted) {
        trackEvent(
          postAnalyticsEvent('remove post upvote', post, {
            extra: { origin: 'article page' },
          }),
        );
        return cancelPostUpvote({ id: post.id });
      }
      if (post) {
        trackEvent(
          postAnalyticsEvent('upvote post', post, {
            extra: { origin: 'article page' },
          }),
        );
        return upvotePost({ id: post.id });
      }
    } else {
      showLogin('upvote', LoginModalMode.ContentQuality);
    }
    return undefined;
  };

  const toggleBookmark = async (): Promise<void> => {
    if (!user) {
      showLogin('bookmark');
      return;
    }
    trackEvent(
      postAnalyticsEvent(
        !post.bookmarked ? 'bookmark post' : 'remove post bookmark',
        post,
        { extra: { origin: 'article page' } },
      ),
    );
    if (!post.bookmarked) {
      await bookmark({ id: post.id });
    } else {
      await removeBookmark({ id: post.id });
    }
  };

  return (
    <div className="flex justify-between py-2 border-t border-b border-theme-divider-tertiary">
      <QuaternaryButton
        id="upvote-post-btn"
        pressed={post.upvoted}
        onClick={toggleUpvote}
        icon={<UpvoteIcon />}
        aria-label="Upvote"
        responsiveLabelClass="mobileL:flex"
        className="btn-tertiary-avocado"
      >
        Upvote
      </QuaternaryButton>
      <QuaternaryButton
        id="comment-post-btn"
        pressed={post.commented}
        onClick={onComment}
        icon={<CommentIcon />}
        aria-label="Comment"
        responsiveLabelClass="mobileL:flex"
        className="btn-tertiary-avocado"
      >
        Comment
      </QuaternaryButton>
      <QuaternaryButton
        id="bookmark-post-btn"
        pressed={post.bookmarked}
        onClick={toggleBookmark}
        icon={<BookmarkIcon />}
        responsiveLabelClass="mobileL:flex"
        className="btn-tertiary-bun"
      >
        Bookmark
      </QuaternaryButton>
    </div>
  );
}
