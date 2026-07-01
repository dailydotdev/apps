import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { UserVote } from '../../../graphql/posts';
import { useViewSize, useVotePost, ViewSize } from '../../../hooks';
import { useBookmarkPost } from '../../../hooks/useBookmarkPost';
import { useBlockPostPanel } from '../../../hooks/post/useBlockPostPanel';
import { useCanAwardUser } from '../../../hooks/useCoresFeature';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { PostOrigin } from '../../../hooks/log/useLogContextData';
import { Origin } from '../../../lib/log';
import { AuthTriggers } from '../../../lib/auth';
import { ButtonColor } from '../../buttons/ButtonV2';
import { CardAction } from '../../buttons/CardAction';
import InteractionCounter from '../../InteractionCounter';
import { UpvoteButtonIcon } from '../../cards/common/UpvoteButtonIcon';
import {
  BookmarkIcon,
  DiscussIcon as CommentIcon,
  DownvoteIcon,
  LinkIcon,
  MedalBadgeIcon,
} from '../../icons';
import { Tooltip } from '../../tooltip/Tooltip';
import type { LoggedUser } from '../../../lib/user';
import { PostClickbaitShield } from '../common/PostClickbaitShield';

interface FocusCardActionBarProps {
  post: Post;
  origin?: PostOrigin;
  onComment?: () => void;
  onCopyLinkClick?: (post?: Post) => void;
  className?: string;
}

// Inner buttons round slightly tighter than their pill so the hover sits
// cleanly inside the border.
const PILL = '!rounded-10';
// Each side is one floating glass bar (macOS/iOS style): a translucent,
// blurred surface with a soft shadow, rounded to match our buttons.
const PILL_WRAP =
  'flex items-center rounded-12 border border-border-subtlest-tertiary bg-surface-float shadow-[0_0.25rem_1.5rem_0_var(--theme-shadow-shadow1)] backdrop-blur-[2.5rem]';

/**
 * Engagement bar for the redesign focus card. Post-contribution actions (vote,
 * comment, award) sit on the left; utility actions (copy link, save, menu) on
 * the right. Each is a bordered surface pill matching our buttons. On tablet up
 * the row floats pinned to the bottom of the scroll area.
 */
export const FocusCardActionBar = ({
  post,
  origin = Origin.ArticlePage,
  onComment,
  onCopyLinkClick,
  className,
}: FocusCardActionBarProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
  const { toggleUpvote, toggleDownvote } = useVotePost();
  const { toggleBookmark } = useBookmarkPost();
  const { onShowPanel, onClose: onCloseBlockPanel } = useBlockPostPanel(post);
  const { openModal } = useLazyModal();
  const canAward = useCanAwardUser({
    sendingUser: user,
    receivingUser: post.author as LoggedUser | undefined,
  });

  // Labels show from tablet up; below that Save / Copy link are icon-only so
  // they collapse to a clean square button (no leftover label space).
  const showLabels = useViewSize(ViewSize.Tablet);
  const isUpvoteActive = post?.userState?.vote === UserVote.Up;
  const isDownvoteActive = post?.userState?.vote === UserVote.Down;
  const isAwarded = !!post?.userState?.awarded;
  const upvotes = post.numUpvotes || 0;
  const comments = post.numComments || 0;
  const awards = post.numAwards || 0;

  const onToggleUpvote = async () => {
    if (post?.userState?.vote === UserVote.None) {
      onCloseBlockPanel(true);
    }
    await toggleUpvote({ payload: post, origin });
  };

  const onToggleDownvote = async () => {
    if (post.userState?.vote !== UserVote.Down) {
      onShowPanel();
    } else {
      onCloseBlockPanel(true);
    }
    await toggleDownvote({ payload: post, origin });
  };

  const onToggleBookmark = async () => {
    await toggleBookmark({ post, origin });
  };

  const onGiveAward = () => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.GiveAward });
      return;
    }
    if (!post.author || isAwarded) {
      return;
    }
    openModal({
      type: LazyModal.GiveAward,
      props: {
        type: 'POST',
        entity: {
          id: post.id,
          receiver: post.author,
          numAwards: post.numAwards,
        },
        post,
      },
    });
  };

  return (
    <div
      className={classNames(
        // Left: post-contribution actions. Right: utility actions. From tablet
        // up the row floats pinned to the bottom of the scroll area.
        'relative z-3 flex w-full flex-wrap items-center justify-between gap-2 tablet:sticky tablet:bottom-4',
        className,
      )}
    >
      {/* Left group: all post-contribution actions share one container.
          Vote is Reddit-style with the score between the arrows. */}
      <div className={PILL_WRAP}>
        <Tooltip content={isUpvoteActive ? 'Remove upvote' : 'Upvote'}>
          <CardAction
            id="upvote-post-btn"
            label="Upvote"
            color={ButtonColor.Avocado}
            icon={<UpvoteButtonIcon />}
            iconPressed={<UpvoteButtonIcon secondary />}
            pressed={isUpvoteActive}
            onClick={onToggleUpvote}
            className={PILL}
          />
        </Tooltip>
        {upvotes > 0 && (
          <span
            className={classNames(
              'min-w-[1.25rem] text-center font-bold tabular-nums typo-footnote',
              isUpvoteActive ? 'text-text-primary' : 'text-text-tertiary',
            )}
            aria-hidden
          >
            <InteractionCounter value={upvotes} />
          </span>
        )}
        <Tooltip content={isDownvoteActive ? 'Remove downvote' : 'Downvote'}>
          <CardAction
            id="downvote-post-btn"
            label="Downvote"
            color={ButtonColor.Ketchup}
            icon={<DownvoteIcon />}
            iconPressed={<DownvoteIcon secondary />}
            pressed={isDownvoteActive}
            onClick={onToggleDownvote}
            className={PILL}
          />
        </Tooltip>
        <Tooltip content="Comment">
          <CardAction
            id="comment-post-btn"
            label="Comment"
            color={ButtonColor.BlueCheese}
            icon={<CommentIcon />}
            iconPressed={<CommentIcon secondary />}
            count={comments}
            pressed={post.commented}
            onClick={onComment}
            className={PILL}
          />
        </Tooltip>
        {canAward && (
          <Tooltip
            content={isAwarded ? 'You already awarded this post!' : 'Award'}
          >
            <CardAction
              id="award-post-btn"
              label="Award"
              color={ButtonColor.Cabbage}
              icon={<MedalBadgeIcon secondary />}
              iconPressed={<MedalBadgeIcon />}
              count={awards}
              pressed={isAwarded}
              onClick={onGiveAward}
              className={PILL}
            />
          </Tooltip>
        )}
      </div>

      {/* Right group: utility actions share one container. Save then Copy
          link; both collapse to icon-only below tablet. */}
      <div className={PILL_WRAP}>
        {post.clickbaitTitleDetected && (
          <PostClickbaitShield post={post} iconOnly />
        )}
        <Tooltip content={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}>
          <CardAction
            id="bookmark-post-btn"
            label={post.bookmarked ? 'Saved' : 'Save'}
            labelVisible={showLabels}
            color={ButtonColor.Bun}
            icon={<BookmarkIcon />}
            iconPressed={<BookmarkIcon secondary />}
            pressed={post.bookmarked}
            onClick={onToggleBookmark}
            className={PILL}
          />
        </Tooltip>
        <Tooltip content="Copy link">
          <CardAction
            label="Copy link"
            labelVisible={showLabels}
            color={ButtonColor.Cabbage}
            icon={<LinkIcon />}
            onClick={() => onCopyLinkClick?.(post)}
            className={PILL}
          />
        </Tooltip>
      </div>
    </div>
  );
};
