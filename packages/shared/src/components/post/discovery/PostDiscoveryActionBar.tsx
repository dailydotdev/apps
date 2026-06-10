import type { ReactElement, ReactNode } from 'react';
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
import { canViewPostAnalytics } from '../../../lib/user';
import { webappUrl } from '../../../lib/constants';
import { PostMenuOptions } from '../PostMenuOptions';
import { PostClickbaitShield } from '../common/PostClickbaitShield';

interface PostDiscoveryActionBarProps {
  post: Post;
  origin?: PostOrigin;
  onComment?: () => void;
  onCopyLinkClick?: (post?: Post) => void;
  /** When provided (post modal), renders an X close button next to the menu. */
  onClose?: () => void;
  className?: string;
}

/**
 * One control in the morphing engagement bar. `pinned` slots are always
 * visible; the rest collapse to zero width on pointer devices and morph open
 * (width + opacity) when the bar is hovered or focused. Touch devices, which
 * have no hover, reveal everything by default.
 *
 * The width morph uses the grid `0fr -> 1fr` track trick (the inner element is
 * `min-w-0 overflow-hidden`) so each control animates to its natural content
 * width — the Liquid Glass "concentrate, then expand on intent" behavior from
 * the iOS 26 toolbar, where the source control stays anchored as siblings grow
 * in around it.
 */
const MorphSlot = ({
  pinned = false,
  children,
}: {
  pinned?: boolean;
  children: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'grid transition-[grid-template-columns,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
      pinned
        ? 'grid-cols-[1fr] opacity-100'
        : 'grid-cols-[1fr] opacity-100 mouse:grid-cols-[0fr] mouse:opacity-0 mouse:group-focus-within/bar:grid-cols-[1fr] mouse:group-focus-within/bar:opacity-100 mouse:group-hover/bar:grid-cols-[1fr] mouse:group-hover/bar:opacity-100',
    )}
  >
    <div className={classNames('min-w-0', pinned ? '' : 'overflow-hidden')}>
      {children}
    </div>
  </div>
);

/**
 * Engagement bar for the discovery focus card, built on the CardAction
 * primitives (PR #6064 guideline): each action's count lives inside the click
 * target so the icon or number performs the action. Sticks to the top while
 * scrolling; the modal X appears only once the bar is pinned.
 *
 * Concentrated by default to the upvote (always) plus any action that has a
 * metric, it morphs open to the full action set on hover/focus — see
 * {@link MorphSlot}.
 */
export const PostDiscoveryActionBar = ({
  post,
  origin = Origin.ArticlePage,
  onComment,
  onCopyLinkClick,
  onClose,
  className,
}: PostDiscoveryActionBarProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
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
  const canSeeAnalytics = canViewPostAnalytics({ user, post });
  // In the modal there is no app header, so pin to the very top; on the post
  // page the bar must sit below the fixed laptop header (4rem). `onClose` is
  // only provided by the post modal, so it doubles as the surface flag.
  const stickyTopClassName = onClose ? 'top-0' : 'top-0 laptop:top-16';

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
          'group/bar bg-background-default/80 sticky z-3 flex items-center justify-between border-b border-t border-b-border-subtlest-tertiary border-t-transparent px-1 py-2 backdrop-blur-xl transition-colors duration-300',
          // Keep the top border present always and toggle its color (visible
          // only before the bar pins) so the bar height — and the content
          // below it — never shifts when it sticks.
          !isStuck && '!border-t-border-subtlest-tertiary',
          stickyTopClassName,
          className,
        )}
      >
        <div className="flex min-w-0 items-center">
          <MorphSlot pinned>
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
          </MorphSlot>
          <MorphSlot>
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
          </MorphSlot>
          <MorphSlot pinned={comments > 0}>
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
          </MorphSlot>
          {canAward && (
            <MorphSlot pinned={awards > 0}>
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
            </MorphSlot>
          )}
        </div>

        <div className="flex items-center">
          <MorphSlot>
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
          </MorphSlot>
          <MorphSlot>
            <Tooltip content="Copy link">
              <CardAction
                label="Copy link"
                color={ButtonColor.Cabbage}
                icon={<LinkIcon />}
                onClick={() => onCopyLinkClick?.(post)}
              />
            </Tooltip>
          </MorphSlot>
          {post.clickbaitTitleDetected && (
            <MorphSlot>
              <PostClickbaitShield post={post} iconOnly />
            </MorphSlot>
          )}
          {canSeeAnalytics && (
            <MorphSlot>
              <Tooltip content="Analytics">
                <CardAction
                  label="Analytics"
                  icon={<AnalyticsIcon />}
                  href={`${webappUrl}posts/${post.id}/analytics`}
                />
              </Tooltip>
            </MorphSlot>
          )}
          <MorphSlot>
            <PostMenuOptions
              post={post}
              origin={Origin.ArticleModal}
              buttonSize={ButtonSize.Medium}
            />
          </MorphSlot>
          {isStuck && onClose && (
            <CloseButton
              className="ml-0.5"
              size={ButtonSize.Medium}
              onClick={() => onClose()}
            />
          )}
        </div>
      </div>
    </>
  );
};
