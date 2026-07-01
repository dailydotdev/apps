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

// Inner buttons round slightly tighter than their surrounding pill so the
// hover sits cleanly inside the pill's border.
const PILL = '!rounded-10';

/**
 * Engagement bar for the redesign focus card, styled like YouTube's action row:
 * each action is its own surface pill (some with a label, some icon-only), the
 * vote actions share one pill split by a divider, and pills are separated by
 * gaps. On tablet up the row floats pinned to the BOTTOM of the scroll area.
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
  // has floated away from its resting spot, so surface the "…" menu the
  // (now scrolled-off) header normally carries.
  const sentinelRef = useRef<HTMLDivElement>(null);
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
  // Sticky to the BOTTOM only (tablet up); it never pins to the top. Below
  // tablet the pills stay in-flow. The "…" menu surfaces only once the bar has
  // floated away from the header that normally owns it.
  const barFloats = useViewSize(ViewSize.Tablet);
  const isPinned = isStuck && barFloats;

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
        className={classNames(
          // YouTube-style row: each action is its own surface pill separated by
          // gaps (no shared bar). From tablet up the row floats pinned to the
          // bottom of the scroll area.
          'relative z-3 flex flex-wrap items-center gap-2 tablet:sticky tablet:bottom-4',
          className,
        )}
      >
        {/* Vote pill: upvote (+ count) and downvote share one surface pill,
            split by a divider — like YouTube's like/dislike. */}
        <div className="flex items-center rounded-12 border border-border-subtlest-tertiary bg-surface-float">
          <Tooltip content={isUpvoteActive ? 'Remove upvote' : 'Upvote'}>
            <CardAction
              id="upvote-post-btn"
              label="Upvote"
              color={ButtonColor.Avocado}
              icon={<UpvoteButtonIcon />}
              iconPressed={<UpvoteButtonIcon secondary />}
              count={upvotes}
              pressed={isUpvoteActive}
              onClick={onToggleUpvote}
              className={PILL}
            />
          </Tooltip>
          <div className="h-5 w-px bg-border-subtlest-tertiary" aria-hidden />
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
        </div>

        <div className="flex rounded-12 border border-border-subtlest-tertiary bg-surface-float">
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
        </div>

        {canAward && (
          <div className="flex rounded-12 border border-border-subtlest-tertiary bg-surface-float">
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
          </div>
        )}

        {/* Save pill — wrapped so the surface shows through; keeps the
            bookmark-reminder dropdown. */}
        <div className="flex rounded-12 border border-border-subtlest-tertiary bg-surface-float">
          <BookmarkButton
            post={post}
            iconSize={IconSize.Small}
            buttonProps={{
              id: 'bookmark-post-btn',
              pressed: post.bookmarked,
              onClick: onToggleBookmark,
              size: ButtonSize.Medium,
              className: PILL,
            }}
          />
        </div>

        {/* Copy link — a labelled pill (text inside, YouTube "Share"-style). */}
        <div className="flex rounded-12 border border-border-subtlest-tertiary bg-surface-float">
          <Tooltip content="Copy link">
            <CardAction
              label="Copy link"
              labelVisible
              color={ButtonColor.Cabbage}
              icon={<LinkIcon />}
              onClick={() => onCopyLinkClick?.(post)}
              className={PILL}
            />
          </Tooltip>
        </div>

        {post.clickbaitTitleDetected && (
          <PostClickbaitShield post={post} iconOnly />
        )}

        {/* While floated, the header (which owns the "…" menu) has scrolled
            away, so surface the menu here as its own pill. */}
        {isPinned && (
          <div className="flex rounded-12 border border-border-subtlest-tertiary bg-surface-float">
            <PostMenuOptions
              post={post}
              origin={origin}
              buttonSize={ButtonSize.Medium}
            />
          </div>
        )}
      </div>
    </>
  );
};
