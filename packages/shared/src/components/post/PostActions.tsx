import React, { ReactElement, useContext } from 'react';
import { QueryKey } from 'react-query';
import classNames from 'classnames';
import UpvoteIcon from '../icons/Upvote';
import CommentIcon from '../icons/Discuss';
import { Post } from '../../graphql/posts';
import { QuaternaryButton } from '../buttons/QuaternaryButton';
import { postAnalyticsEvent } from '../../lib/feed';
import AuthContext from '../../contexts/AuthContext';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { PostOrigin } from '../../hooks/analytics/useAnalyticsContextData';
import { postEventName } from '../utilities';
import ShareIcon from '../icons/Share';
import useUpdatePost from '../../hooks/useUpdatePost';
import { mutationHandlers, useVotePost } from '../../hooks';
import { Origin } from '../../lib/analytics';
import { AuthTriggers } from '../../lib/auth';
import BookmarkIcon from '../icons/Bookmark';
import DownvoteIcon from '../icons/Downvote';
import { Card } from '../cards/Card';

export interface ShareBookmarkProps {
  onShare: (post: Post) => void;
  onBookmark: () => void;
}

interface PostActionsProps extends ShareBookmarkProps {
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
  const { upvotePost, cancelPostUpvote, downvotePost, cancelPostDownvote } =
    useVotePost({
      onUpvotePostMutate: updatePost({
        id: post.id,
        update: mutationHandlers.upvote(post),
      }),
      onCancelPostUpvoteMutate: updatePost({
        id: post.id,
        update: mutationHandlers.cancelUpvote(post),
      }),
      onDownvotePostMutate: updatePost({
        id: post.id,
        update: mutationHandlers.downvote(post),
      }),
      onCancelPostDownvoteMutate: updatePost({
        id: post.id,
        update: mutationHandlers.cancelDownvote(post),
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

  const toggleDownvote = () => {
    if (!post) {
      return;
    }

    if (!user) {
      showLogin(AuthTriggers.Downvote);

      return;
    }

    if (post.downvoted) {
      cancelPostDownvote({ id: post.id });
    } else {
      downvotePost({ id: post.id });
    }
  };

  return (
    <div className="flex items-center rounded-16 border border-theme-divider-tertiary">
      <Card
        className={classNames(
          'flex !flex-row hover:border-theme-divider-tertiary gap-2',
          {
            'border-avocado-40 hover:!border-avocado-40 bg-avocado-50/8':
              post.upvoted,
            'border-ketchup-40 hover:!border-ketchup-40 bg-ketchup-50/8':
              post.downvoted,
          },
        )}
      >
        <QuaternaryButton
          id="upvote-post-btn"
          pressed={post.upvoted}
          onClick={toggleUpvote}
          icon={<UpvoteIcon secondary={post.upvoted} />}
          aria-label="Upvote"
          responsiveLabelClass={actionsClassName}
          className="btn-tertiary-avocado"
        />
        <QuaternaryButton
          id="downvote-post-btn"
          pressed={post.downvoted}
          onClick={toggleDownvote}
          icon={<DownvoteIcon secondary={post.downvoted} />}
          aria-label="Downvote"
          responsiveLabelClass={actionsClassName}
          className="btn-tertiary-ketchup"
        />
      </Card>
      <div className="flex flex-1 justify-between items-center py-2 px-4">
        <QuaternaryButton
          id="comment-post-btn"
          pressed={post.commented}
          onClick={onComment}
          icon={<CommentIcon secondary={post.commented} />}
          aria-label="Comment"
          responsiveLabelClass={actionsClassName}
          className="btn-tertiary-blueCheese"
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
          onClick={() => onShare(post)}
          icon={<ShareIcon />}
          responsiveLabelClass={actionsClassName}
          className="btn-tertiary-cabbage"
        >
          Share
        </QuaternaryButton>
      </div>
    </div>
  );
}
