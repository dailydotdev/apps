import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  DiscussIcon as CommentIcon,
  DownvoteIcon,
  LinkIcon,
  UpvoteIcon,
} from '../icons';
import type { Post } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import { QuaternaryButton } from '../buttons/QuaternaryButton';
import { BookmarkButton } from '../buttons';
import { ButtonColor, ButtonSize, ButtonVariant } from '../buttons/Button';
import { IconSize } from '../Icon';
import InteractionCounter from '../InteractionCounter';
import { useVotePost } from '../../hooks/vote/useVotePost';
import { useBookmarkPost } from '../../hooks/useBookmarkPost';
import { useBlockPostPanel } from '../../hooks/post/useBlockPostPanel';
import { useLoggedCopyPostLink } from '../../hooks/post/useLoggedCopyPostLink';
import { ShareProvider } from '../../lib/share';
import type { Origin } from '../../lib/log';
import { Origin as LogOrigin } from '../../lib/log';

export interface MobilePostFloatingBarProps {
  post: Post;
  onCommentClick: (origin: Origin) => void;
  className?: string;
}

// Mirrors the floating "Share your thoughts" container that this bar replaces.
// `bg-surface-float` is the gray translucent tint the old bar effectively rendered
// (it was the surviving class once Tailwind layered `bg-blur-baseline` underneath),
// paired with the same backdrop blur and shadow used by the mobile footer chrome.
// Buttons use `justify-between` so they span the full bar width edge-to-edge, with a
// small horizontal pad so the outermost icons don't kiss the rounded corner.
const containerClasses = classNames(
  'flex w-full items-center justify-between rounded-16 border border-border-subtlest-tertiary px-2 py-1',
  'bg-surface-float backdrop-blur-[2.5rem]',
  'shadow-[0_0.25rem_1.5rem_0_var(--theme-shadow-shadow1)]',
);

export function MobilePostFloatingBar({
  post,
  onCommentClick,
  className,
}: MobilePostFloatingBarProps): ReactElement {
  const origin = LogOrigin.ArticlePage;
  const { onClose, onShowPanel } = useBlockPostPanel(post);
  const { toggleUpvote, toggleDownvote } = useVotePost();
  const { toggleBookmark } = useBookmarkPost();
  const { onCopyLink } = useLoggedCopyPostLink(post, origin);

  const isUpvoteActive = post?.userState?.vote === UserVote.Up;
  const isDownvoteActive = post?.userState?.vote === UserVote.Down;
  const upvoteCount = post.numUpvotes ?? 0;
  const commentCount = post.numComments ?? 0;

  const onToggleUpvote = async () => {
    if (post?.userState?.vote === UserVote.None) {
      onClose(true);
    }

    await toggleUpvote({ payload: post, origin });
  };

  const onToggleDownvote = async () => {
    if (post.userState?.vote !== UserVote.Down) {
      onShowPanel();
    } else {
      onClose(true);
    }

    await toggleDownvote({ payload: post, origin });
  };

  const onToggleBookmark = async () => {
    await toggleBookmark({ post, origin });
  };

  return (
    <div className={classNames(containerClasses, className)}>
      <QuaternaryButton
        id="upvote-post-btn"
        aria-label={isUpvoteActive ? 'Remove upvote' : 'Upvote'}
        pressed={isUpvoteActive}
        onClick={onToggleUpvote}
        icon={<UpvoteIcon secondary={isUpvoteActive} />}
        variant={ButtonVariant.Tertiary}
        color={ButtonColor.Avocado}
        size={ButtonSize.Medium}
        className="btn-tertiary-avocado"
      >
        {upvoteCount > 0 && (
          <InteractionCounter className="tabular-nums" value={upvoteCount} />
        )}
      </QuaternaryButton>
      <QuaternaryButton
        id="downvote-post-btn"
        aria-label={isDownvoteActive ? 'Remove downvote' : 'Downvote'}
        pressed={isDownvoteActive}
        onClick={onToggleDownvote}
        icon={<DownvoteIcon secondary={isDownvoteActive} />}
        variant={ButtonVariant.Tertiary}
        color={ButtonColor.Ketchup}
        size={ButtonSize.Medium}
      />
      <QuaternaryButton
        id="comment-post-btn"
        aria-label="Comment"
        pressed={post.commented}
        onClick={() => onCommentClick(LogOrigin.PostCommentButton)}
        icon={<CommentIcon secondary={post.commented} />}
        variant={ButtonVariant.Tertiary}
        color={ButtonColor.BlueCheese}
        size={ButtonSize.Medium}
        className="btn-tertiary-blueCheese"
      >
        {commentCount > 0 && (
          <InteractionCounter className="tabular-nums" value={commentCount} />
        )}
      </QuaternaryButton>
      <BookmarkButton
        post={post}
        iconSize={IconSize.Medium}
        buttonProps={{
          id: 'bookmark-post-btn',
          pressed: post.bookmarked,
          onClick: onToggleBookmark,
          size: ButtonSize.Medium,
          className: 'btn-tertiary-bun',
        }}
      />
      <QuaternaryButton
        id="copy-post-btn"
        aria-label="Copy link"
        onClick={() => onCopyLink(ShareProvider.CopyLink)}
        icon={<LinkIcon />}
        variant={ButtonVariant.Tertiary}
        color={ButtonColor.Cabbage}
        size={ButtonSize.Medium}
      />
    </div>
  );
}
