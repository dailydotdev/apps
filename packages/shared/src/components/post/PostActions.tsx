import React, { ReactElement, useContext } from 'react';
import { QueryClient, useQueryClient, QueryKey } from 'react-query';
import UpvoteIcon from '../../../icons/upvote.svg';
import CommentIcon from '../../../icons/comment.svg';
import BookmarkIcon from '../../../icons/bookmark.svg';
import { Post, PostData } from '../../graphql/posts';
import { QuaternaryButton } from '../buttons/QuaternaryButton';
import useUpvotePost from '../../hooks/useUpvotePost';
import useBookmarkPost from '../../hooks/useBookmarkPost';
import { postAnalyticsEvent } from '../../lib/feed';
import AuthContext from '../../contexts/AuthContext';
import AnalyticsContext from '../../contexts/AnalyticsContext';

interface PostActionsProps {
  post: Post;
  postQueryKey: QueryKey;
  actionsClassName?: string;
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
  actionsClassName = 'hidden mobileL:flex',
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
      showLogin('upvote');
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
        responsiveLabelClass={actionsClassName}
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
        responsiveLabelClass={actionsClassName}
        className="btn-tertiary-avocado"
      >
        Comment
      </QuaternaryButton>
      <QuaternaryButton
        id="bookmark-post-btn"
        pressed={post.bookmarked}
        onClick={toggleBookmark}
        icon={<BookmarkIcon />}
        responsiveLabelClass={actionsClassName}
        className="btn-tertiary-bun"
      >
        Bookmark
      </QuaternaryButton>
    </div>
  );
}
