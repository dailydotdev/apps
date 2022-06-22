import React, { ReactElement, useContext } from 'react';
import { QueryClient, useQueryClient, QueryKey } from 'react-query';
import UpvoteIcon from '../icons/Upvote';
import CommentIcon from '../icons/Discuss';
import BookmarkIcon from '../icons/Bookmark';
import { Post, PostData } from '../../graphql/posts';
import { QuaternaryButton } from '../buttons/QuaternaryButton';
import useUpvotePost from '../../hooks/useUpvotePost';
import useBookmarkPost from '../../hooks/useBookmarkPost';
import { postAnalyticsEvent } from '../../lib/feed';
import AuthContext from '../../contexts/AuthContext';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { PostOrigin } from '../../hooks/analytics/useAnalyticsContextData';
import { postEventName } from '../utilities';
import ForwardIcon from '../icons/Forward';

export type OnShareProps = {
  onShare: () => void;
  onBookmark: () => void;
};

interface PostActionsProps extends OnShareProps {
  post: Post;
  postQueryKey: QueryKey;
  actionsClassName?: string;
  onComment?: () => unknown;
  origin?: PostOrigin;
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

export function PostActions({
  onShare,
  onBookmark,
  post,
  postQueryKey,
  actionsClassName = 'hidden mobileL:flex',
  onComment,
  origin = 'article page',
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

  const toggleUpvote = () => {
    if (user) {
      if (post.upvoted) {
        trackEvent(
          postAnalyticsEvent(postEventName({ upvoted: false }), post, {
            extra: { origin },
          }),
        );
        return cancelPostUpvote({ id: post.id });
      }
      if (post) {
        trackEvent(
          postAnalyticsEvent(postEventName({ upvoted: true }), post, {
            extra: { origin },
          }),
        );
        return upvotePost({ id: post.id });
      }
    } else {
      showLogin('upvote');
    }
    return undefined;
  };

  return (
    <div className="flex justify-between py-2 border-t border-b border-theme-divider-tertiary">
      <QuaternaryButton
        id="upvote-post-btn"
        pressed={post.upvoted}
        onClick={toggleUpvote}
        icon={<UpvoteIcon filled={post.upvoted} />}
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
        icon={<CommentIcon filled={post.commented} />}
        aria-label="Comment"
        responsiveLabelClass={actionsClassName}
        className="btn-tertiary-avocado"
      >
        Comment
      </QuaternaryButton>
      <QuaternaryButton
        id="bookmark-post-btn"
        pressed={post.bookmarked}
        onClick={onBookmark}
        icon={<BookmarkIcon filled={post.bookmarked} />}
        responsiveLabelClass={actionsClassName}
        className="btn-tertiary-bun"
      >
        Bookmark
      </QuaternaryButton>
      <QuaternaryButton
        id="share-post-btn"
        onClick={onShare}
        icon={<ForwardIcon />}
        responsiveLabelClass={actionsClassName}
        className="btn-tertiary-bun"
      >
        Share
      </QuaternaryButton>
    </div>
  );
}
