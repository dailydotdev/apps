import React, { ReactElement, useContext } from 'react';
import { QueryKey } from 'react-query';
import UpvoteIcon from '../icons/Upvote';
import CommentIcon from '../icons/Discuss';
import { Post } from '../../graphql/posts';
import { QuaternaryButton } from '../buttons/QuaternaryButton';
import useUpvotePost from '../../hooks/useUpvotePost';
import { postAnalyticsEvent } from '../../lib/feed';
import AuthContext from '../../contexts/AuthContext';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { PostOrigin } from '../../hooks/analytics/useAnalyticsContextData';
import { postEventName } from '../utilities';
import ShareIcon from '../icons/Share';
import useUpdatePost from '../../hooks/useUpdatePost';
import { Origin } from '../../lib/analytics';
import { AuthTriggers } from '../../lib/auth';
import BookmarkIcon from '../icons/Bookmark';

export type OnShareOrBookmarkProps = {
  onShare: () => void;
  onBookmark: () => void;
};

interface PostActionsProps extends OnShareOrBookmarkProps {
  post: Post;
  postQueryKey: QueryKey;
  actionsClassName?: string;
  onComment?: () => unknown;
  origin?: PostOrigin;
}

export function PostActions({
  onShare,
  post,
  actionsClassName = 'hidden mobileL:flex',
  onComment,
  onBookmark,
  origin = Origin.ArticlePage,
}: PostActionsProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const { user, showLogin } = useContext(AuthContext);
  const { updatePost } = useUpdatePost();
  const { upvotePost, cancelPostUpvote } = useUpvotePost({
    onUpvotePostMutate: updatePost({
      id: post.id,
      update: { upvoted: true, numUpvotes: post.numUpvotes + 1 },
    }),
    onCancelPostUpvoteMutate: updatePost({
      id: post.id,
      update: { upvoted: false, numUpvotes: post.numUpvotes + -1 },
    }),
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
      showLogin(AuthTriggers.Upvote);
    }
    return undefined;
  };

  return (
    <div className="flex justify-between py-2 px-4 rounded-16 border border-theme-divider-tertiary">
      <QuaternaryButton
        id="upvote-post-btn"
        pressed={post.upvoted}
        onClick={toggleUpvote}
        icon={<UpvoteIcon secondary={post.upvoted} />}
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
        icon={<CommentIcon secondary={post.commented} />}
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
        icon={<BookmarkIcon secondary={post.bookmarked} />}
        aria-label="Bookmark"
        responsiveLabelClass={actionsClassName}
        className="btn-tertiary-bun"
      >
        Bookmark
      </QuaternaryButton>
      <QuaternaryButton
        id="share-post-btn"
        onClick={onShare}
        icon={<ShareIcon />}
        responsiveLabelClass={actionsClassName}
        className="btn-tertiary-cabbage"
      >
        Share
      </QuaternaryButton>
    </div>
  );
}
