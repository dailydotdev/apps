import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { UserVote } from '../../../graphql/posts';
import { useVotePost } from '../../../hooks';
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

/**
 * Engagement bar for the redesign focus card: one full-width floating glass bar
 * (translucent, blurred, soft shadow) with post-contribution actions on the
 * left and utility actions on the right. Floats pinned to the BOTTOM of the
 * scroll area on tablet up (never the top).
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

  const isUpvoteActive = post?.userState?.vote === UserVote.Up;
  const isDownvoteActive = post?.userState?.vote === UserVote.Down;
  const isAwarded = !!post?.userState?.awarded;

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
        // One full-width floating glass bar (macOS/iOS style): translucent,
        // blurred, soft shadow. Post-contribution actions on the left, utility
        // actions on the right. Floats pinned to the bottom from tablet up
        // (never the top).
        'relative z-3 flex w-full items-center justify-between gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-2 py-1 shadow-[0_0.25rem_1.5rem_0_var(--theme-shadow-shadow1)] backdrop-blur-[2.5rem] tablet:sticky tablet:bottom-4',
        className,
      )}
    >
      <div className="flex items-center gap-1">
        <Tooltip content={isUpvoteActive ? 'Remove upvote' : 'Upvote'}>
          <CardAction
            id="upvote-post-btn"
            label="Upvote"
            color={ButtonColor.Avocado}
            icon={<UpvoteButtonIcon />}
            iconPressed={<UpvoteButtonIcon secondary />}
            pressed={isUpvoteActive}
            onClick={onToggleUpvote}
          />
        </Tooltip>
        <Tooltip content={isDownvoteActive ? 'Remove downvote' : 'Downvote'}>
          <CardAction
            id="downvote-post-btn"
            label="Downvote"
            color={ButtonColor.Ketchup}
            icon={<DownvoteIcon />}
            iconPressed={<DownvoteIcon secondary />}
            pressed={isDownvoteActive}
            onClick={onToggleDownvote}
          />
        </Tooltip>
        <Tooltip content="Comment">
          <CardAction
            id="comment-post-btn"
            label="Comment"
            color={ButtonColor.BlueCheese}
            icon={<CommentIcon />}
            iconPressed={<CommentIcon secondary />}
            pressed={post.commented}
            onClick={onComment}
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
              pressed={isAwarded}
              onClick={onGiveAward}
            />
          </Tooltip>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Tooltip content={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}>
          <CardAction
            id="bookmark-post-btn"
            label={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}
            color={ButtonColor.Bun}
            icon={<BookmarkIcon />}
            iconPressed={<BookmarkIcon secondary />}
            pressed={post.bookmarked}
            onClick={onToggleBookmark}
          />
        </Tooltip>
        <Tooltip content="Copy link">
          <CardAction
            label="Copy link"
            color={ButtonColor.Cabbage}
            icon={<LinkIcon />}
            onClick={() => onCopyLinkClick?.(post)}
          />
        </Tooltip>
        {post.clickbaitTitleDetected && (
          <PostClickbaitShield post={post} iconOnly />
        )}
      </div>
    </div>
  );
};
