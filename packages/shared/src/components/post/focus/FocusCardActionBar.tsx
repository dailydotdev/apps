import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
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
import { ButtonSize } from '../../buttons/Button';
import { ButtonColor } from '../../buttons/ButtonV2';
import { CardAction } from '../../buttons/CardAction';
import { BookmarkButton } from '../../buttons/BookmarkButton';
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
import { PostMenuOptions } from '../PostMenuOptions';

interface FocusCardActionBarProps {
  post: Post;
  origin?: PostOrigin;
  onComment?: () => void;
  onCopyLinkClick?: (post?: Post) => void;
  className?: string;
}

/**
 * Engagement bar for the redesign focus card, built on the CardAction
 * primitives (PR #6064 guideline): each action's count lives inside the click
 * target so the icon or number performs the action. On tablet up it floats as a
 * centred pill pinned to the BOTTOM of the scroll area while reading (never the
 * top), matching the reader and mobile bars.
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

  // The sentinel sits just above the bar; once it leaves the viewport the bar
  // has floated away from its resting spot, so surface the counts + menu that
  // the (now scrolled-off) stats row and header normally carry.
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
  // Counts are hidden in the resting bar (the stats row sitting right above it
  // already shows them) and surface only once the bar is pinned and that row
  // has scrolled away.
  const upvotes = post.numUpvotes || 0;
  const comments = post.numComments || 0;
  const awards = post.numAwards || 0;
  // Sticky to the BOTTOM only (tablet up) — the bar floats near the bottom of
  // the scroll area while reading and settles into its resting spot once
  // scrolled to. It never pins to the top (that fought the header and read as
  // odd). Below tablet it stays in-flow; the dedicated mobile bar handles the
  // pinned behaviour there.
  const barFloats = useViewSize(ViewSize.Tablet);
  const isPinned = isStuck && barFloats;

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
    // isPinned/counts change the row width (counts + "…" menu appear when pinned).
  }, [
    canAward,
    post.clickbaitTitleDetected,
    post.bookmarked,
    isPinned,
    upvotes,
    comments,
    awards,
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
          // Full-width bar (translucent surface, blur, soft shadow, full
          // border) with the actions spread edge-to-edge (justify-between) so
          // they read as an evenly spaced, consistent set. From tablet up it
          // floats pinned to the BOTTOM of the scroll area (never the top).
          'relative z-3 flex w-full items-center justify-between gap-1 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-2 py-1 shadow-[0_0.25rem_1.5rem_0_var(--theme-shadow-shadow1)] backdrop-blur-[2.5rem] tablet:sticky tablet:bottom-4',
          className,
        )}
      >
        <Tooltip content={isUpvoteActive ? 'Remove upvote' : 'Upvote'}>
          <CardAction
            id="upvote-post-btn"
            label="Upvote"
            color={ButtonColor.Avocado}
            icon={<UpvoteButtonIcon />}
            iconPressed={<UpvoteButtonIcon secondary />}
            count={isPinned ? upvotes : undefined}
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
            count={isPinned ? comments : undefined}
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
              count={isPinned ? awards : undefined}
              pressed={isAwarded}
              onClick={onGiveAward}
            />
          </Tooltip>
        )}
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
        {/* While pinned, the article header (which owns the "…" menu) has
              scrolled away, so surface the menu here — to the left of the X. */}
        {isPinned && (
          <PostMenuOptions
            post={post}
            origin={origin}
            buttonSize={ButtonSize.Medium}
          />
        )}
      </div>
    </>
  );
};
