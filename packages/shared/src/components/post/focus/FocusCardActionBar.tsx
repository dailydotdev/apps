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
  AnalyticsIcon,
  DiscussIcon as CommentIcon,
  DownvoteIcon,
  LinkIcon,
  MedalBadgeIcon,
} from '../../icons';
import { Tooltip } from '../../tooltip/Tooltip';
import type { LoggedUser } from '../../../lib/user';
import {
  formatImpressions,
  getPostImpressions,
} from '../../../lib/impressions';
import { usePostImpressionsModal } from '../../../hooks/post/usePostImpressionsModal';
import { PostClickbaitShield } from '../common/PostClickbaitShield';
import { PostMenuOptions } from '../PostMenuOptions';

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

  // Track whether the bar is pinned, and at which edge. The sentinel sits just
  // above the bar: when it scrolls above the viewport top the bar is pinned at
  // the TOP; when it's still below the viewport the bar is floating at the
  // BOTTOM. The modal's X is only useful at the top (where the top nav strip
  // has scrolled away) — at the bottom that strip is still on screen.
  const sentinelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const copyLinkRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);
  const [isStuckTop, setIsStuckTop] = useState(false);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        const stuck = !entry.isIntersecting;
        setIsStuck(stuck);
        const rootTop = entry.rootBounds?.top ?? 0;
        setIsStuckTop(stuck && entry.boundingClientRect.top < rootTop);
      },
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
  const impressions = getPostImpressions(post);
  const onImpressionsClick = usePostImpressionsModal(post);
  // The bar floats (sticky) from tablet up, so surface the metrics + menu
  // whenever it's actually pinned there — including when a long post floats it
  // at the bottom on load, where the stats row above has scrolled off. Below
  // tablet the bar is plain in-flow, so keep it stable (no counts) — that's the
  // width where toggling on scroll looked like flicker.
  const barFloats = useViewSize(ViewSize.Tablet);
  const isPinned = isStuck && barFloats;
  // The X (modal close) only makes sense when pinned at the top; at the bottom
  // the modal's top strip — and its own close — are still on screen.
  const isPinnedTop = isStuckTop && barFloats;
  // Sticky at BOTH edges (`top` + `bottom`), tablet and up only — on mobile the
  // dedicated floating bottom bar already covers this, so the desktop treatment
  // is excluded there. While its natural spot is still below the fold the bar
  // pins near the bottom (always reachable), scrolls naturally through the
  // viewport, then pins near the top once it scrolls above. `top-4`/`bottom-4`
  // leave a gap from each edge so the pill reads as floating. The top offset
  // also accounts for the top chrome — the modal has no app header; on the post
  // page the v2 rail hides the global header on laptop for logged-in users, so
  // the bar floats near the top, while the legacy/logged-out layout must clear
  // a fixed 4rem header (4rem + 1rem gap = top-20). `onClose` is modal-only.
  const railOwnsHeader = isV2 && !!user;
  const stickyOffsetClassName =
    onClose || railOwnsHeader
      ? 'tablet:top-4 tablet:bottom-4'
      : 'tablet:top-4 tablet:bottom-4 laptop:top-20';

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
          // Same floating-pill design on every resolution (incl. the
          // translucent surface): rounded, blur, soft shadow, full border.
          // Sticky from tablet up only — on mobile it stays in-flow, since the
          // dedicated footer floating bar handles the pinned behavior there.
          'relative z-3 flex items-center justify-between gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-2 py-1 shadow-[0_0.25rem_1.5rem_0_var(--theme-shadow-shadow1)] backdrop-blur-[2.5rem] tablet:sticky',
          stickyOffsetClassName,
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
              count={isPinned ? upvotes : undefined}
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
          <Tooltip content="Impressions">
            <CardAction
              id="impressions-post-btn"
              label="Impressions"
              color={ButtonColor.Cheese}
              icon={<AnalyticsIcon />}
              count={isPinned ? impressions : undefined}
              countFormat={formatImpressions}
              onClick={onImpressionsClick}
            />
          </Tooltip>
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
          {isPinnedTop && onClose && (
            <CloseButton size={ButtonSize.Medium} onClick={() => onClose()} />
          )}
        </div>
      </div>
    </>
  );
};
