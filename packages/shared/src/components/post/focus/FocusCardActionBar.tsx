import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { UserVote } from '../../../graphql/posts';
import { useVotePost } from '../../../hooks';
import { useBookmarkPost } from '../../../hooks/useBookmarkPost';
import { useBlockPostPanel } from '../../../hooks/post/useBlockPostPanel';
import { useCanAwardUser } from '../../../hooks/useCoresFeature';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { useLayoutVariant } from '../../../hooks/layout/useLayoutVariant';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { PostOrigin } from '../../../hooks/log/useLogContextData';
import { Origin } from '../../../lib/log';
import { AuthTriggers } from '../../../lib/auth';
import { ButtonSize } from '../../buttons/Button';
import { ButtonColor } from '../../buttons/ButtonV2';
import { CardAction } from '../../buttons/CardAction';
import { BookmarkButton } from '../../buttons/BookmarkButton';
import CloseButton from '../../CloseButton';
import { UpvoteButtonIcon } from '../../cards/common/UpvoteButtonIcon';
import { IconSize } from '../../Icon';
import {
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
  /** When provided (post modal), renders an X close button next to the menu. */
  onClose?: () => void;
  className?: string;
}

/**
 * Engagement bar for the redesign focus card, built on the CardAction
 * primitives (PR #6064 guideline): each action's count lives inside the click
 * target so the icon or number performs the action. Sticks to the top while
 * scrolling; the modal X appears only once the bar is pinned.
 */
export const FocusCardActionBar = ({
  post,
  origin = Origin.ArticlePage,
  onComment,
  onCopyLinkClick,
  onClose,
  className,
}: FocusCardActionBarProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
  const { isV2 } = useLayoutVariant();
  const { toggleUpvote, toggleDownvote } = useVotePost();
  const { toggleBookmark } = useBookmarkPost();
  const { onShowPanel, onClose: onCloseBlockPanel } = useBlockPostPanel(post);
  const { openModal } = useLazyModal();
  const canAward = useCanAwardUser({
    sendingUser: user,
    receivingUser: post.author as LoggedUser | undefined,
  });

  // Detect when the sticky bar is pinned to the top so the X close button
  // (modal only) appears just for the stuck state.
  const sentinelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const copyLinkRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isUpvoteActive = post?.userState?.vote === UserVote.Up;
  const isDownvoteActive = post?.userState?.vote === UserVote.Down;
  const isAwarded = !!post?.userState?.awarded;
  const upvotes = post.numUpvotes || 0;
  const comments = post.numComments || 0;
  const awards = post.numAwards || 0;
  // Sticky offset depends on the top chrome. The modal has no app header (pin
  // to the very top). On the post page, the v2 rail layout hides the global
  // header on laptop for logged-in users, so the bar sticks to the very top
  // like the feed nav; the legacy/logged-out layout keeps a fixed 4rem header
  // the bar must clear. `onClose` is only provided by the modal.
  const railOwnsHeader = isV2 && !!user;
  const stickyTopClassName =
    onClose || railOwnsHeader ? 'top-0' : 'top-0 laptop:top-16';

  // Fold copy link out of the row when the bar would overflow, and bring it
  // back inline when there is room again. Measured against the real available
  // width — not breakpoints — so it reacts to page/modal resizing.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) {
      return undefined;
    }
    const fit = () => {
      const copyLink = copyLinkRef.current;
      // Show first (inline display overrides the SSR fallback classes), then
      // hide it if the row still overflows.
      if (copyLink) {
        copyLink.style.display = 'flex';
      }
      const overflows = () => bar.scrollWidth > bar.clientWidth;
      if (copyLink && overflows()) {
        copyLink.style.display = 'none';
      }
    };
    fit();
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(fit);
    observer.observe(bar);
    return () => observer.disconnect();
  }, [
    upvotes,
    comments,
    awards,
    canAward,
    post.clickbaitTitleDetected,
    post.bookmarked,
  ]);

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
    <>
      <div ref={sentinelRef} aria-hidden className="pointer-events-none h-0" />
      <div
        ref={barRef}
        className={classNames(
          // Static on mobile (no sticky), sticky from tablet up so the bar
          // never overlaps the small-screen reading flow.
          'relative z-3 flex items-center justify-between gap-2 border-b border-border-subtlest-tertiary bg-background-default px-1 py-2 tablet:sticky',
          // Drop the top border once pinned so it doesn't double up with the
          // header border above it.
          !isStuck && 'border-t',
          stickyTopClassName,
          className,
        )}
      >
        <div className="flex items-center gap-1">
          <Tooltip
            content={isUpvoteActive ? 'Remove upvote' : 'More like this'}
          >
            <CardAction
              id="upvote-post-btn"
              label="Upvote"
              color={ButtonColor.Avocado}
              icon={<UpvoteButtonIcon />}
              iconPressed={<UpvoteButtonIcon secondary />}
              count={upvotes}
              pressed={isUpvoteActive}
              onClick={onToggleUpvote}
            />
          </Tooltip>
          <Tooltip
            content={isDownvoteActive ? 'Remove downvote' : 'Less like this'}
          >
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
              count={comments}
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
                count={awards}
                pressed={isAwarded}
                onClick={onGiveAward}
              />
            </Tooltip>
          )}
        </div>

        <div className="flex items-center gap-1">
          <BookmarkButton
            post={post}
            iconSize={IconSize.Small}
            buttonProps={{
              id: 'bookmark-post-btn',
              pressed: post.bookmarked,
              onClick: onToggleBookmark,
              size: ButtonSize.Medium,
            }}
          />
          {/* Bookmark stays — it is the primary save action. Copy link folds
              out when space is tight (see the overflow effect); the
              `hidden tablet:flex` classes are only the pre-measurement (SSR)
              fallback — the effect overrides display once it measures. The "…"
              menu and analytics now live in the card header / stats row. */}
          <div ref={copyLinkRef} className="hidden tablet:flex">
            <Tooltip content="Copy link">
              <CardAction
                label="Copy link"
                color={ButtonColor.Cabbage}
                icon={<LinkIcon />}
                onClick={() => onCopyLinkClick?.(post)}
              />
            </Tooltip>
          </div>
          {post.clickbaitTitleDetected && (
            <PostClickbaitShield post={post} iconOnly />
          )}
          {isStuck && onClose && (
            <CloseButton size={ButtonSize.Medium} onClick={() => onClose()} />
          )}
        </div>
      </div>
    </>
  );
};
