import React, { ReactElement, useContext } from 'react';
import { QueryKey } from 'react-query';
import UpvoteIcon from '../icons/Upvote';
import CommentIcon from '../icons/Discuss';
import BookmarkIcon from '../icons/Bookmark';
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
import { AdditionalInteractionButtons } from '../../lib/featureValues';
import { Origin } from '../../lib/analytics';

export type OnShareOrBookmarkProps = {
  additionalInteractionButtonFeature: string;
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
  additionalInteractionButtonFeature,
  onShare,
  onBookmark,
  post,
  actionsClassName = 'hidden mobileL:flex',
  onComment,
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
      {additionalInteractionButtonFeature ===
      AdditionalInteractionButtons.Bookmark ? (
        <QuaternaryButton
          id="bookmark-post-btn"
          pressed={post.bookmarked}
          onClick={onBookmark}
          icon={<BookmarkIcon secondary={post.bookmarked} />}
          responsiveLabelClass={actionsClassName}
          className="btn-tertiary-bun"
        >
          Bookmark
        </QuaternaryButton>
      ) : (
        <QuaternaryButton
          id="share-post-btn"
          onClick={onShare}
          icon={<ShareIcon />}
          responsiveLabelClass={actionsClassName}
          className="btn-tertiary-cabbage"
        >
          Share
        </QuaternaryButton>
      )}
    </div>
  );
}
