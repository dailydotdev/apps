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
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { QuaternaryButton } from '../../buttons/QuaternaryButton';
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
import Link from '../../utilities/Link';
import { largeNumberFormat } from '../../../lib';
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
 * Compact, border-framed engagement bar for the discovery focus card. Each
 * action keeps its count inline in the same button, so clicking the icon or
 * the number performs the action (vote/comment/award) — the dedicated popups
 * live in the stats strip below the tags. Sticks to the top while scrolling.
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

  const isUpvoteActive = post?.userState?.vote === UserVote.Up;
  const isDownvoteActive = post?.userState?.vote === UserVote.Down;
  const isAwarded = !!post?.userState?.awarded;
  const upvotes = post.numUpvotes || 0;
  const comments = post.numComments || 0;
  const awards = post.numAwards || 0;
  const canSeeAnalytics = canViewPostAnalytics({ user, post });

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
        'sticky top-0 z-3 my-2 flex items-center justify-between gap-4 border-y border-border-subtlest-tertiary bg-background-default px-1 py-3',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Tooltip content={isUpvoteActive ? 'Remove upvote' : 'More like this'}>
          <QuaternaryButton
            id="upvote-post-btn"
            aria-label="Upvote"
            color={ButtonColor.Avocado}
            icon={
              <UpvoteButtonIcon
                secondary={isUpvoteActive}
                size={IconSize.Small}
              />
            }
            onClick={onToggleUpvote}
            pressed={isUpvoteActive}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          >
            {upvotes > 0 ? largeNumberFormat(upvotes) : undefined}
          </QuaternaryButton>
        </Tooltip>
        <Tooltip
          content={isDownvoteActive ? 'Remove downvote' : 'Less like this'}
        >
          <QuaternaryButton
            id="downvote-post-btn"
            aria-label="Downvote"
            color={ButtonColor.Ketchup}
            icon={
              <DownvoteIcon
                secondary={isDownvoteActive}
                size={IconSize.Small}
              />
            }
            onClick={onToggleDownvote}
            pressed={isDownvoteActive}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
        </Tooltip>
        <Tooltip content="Comment">
          <QuaternaryButton
            id="comment-post-btn"
            aria-label="Comment"
            color={ButtonColor.BlueCheese}
            icon={
              <CommentIcon secondary={post.commented} size={IconSize.Small} />
            }
            onClick={onComment}
            pressed={post.commented}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          >
            {comments > 0 ? largeNumberFormat(comments) : undefined}
          </QuaternaryButton>
        </Tooltip>
        {canAward && (
          <Tooltip
            content={isAwarded ? 'You already awarded this post!' : 'Award'}
          >
            <QuaternaryButton
              id="award-post-btn"
              aria-label="Award"
              color={ButtonColor.Cabbage}
              icon={
                <MedalBadgeIcon secondary={isAwarded} size={IconSize.Small} />
              }
              onClick={onGiveAward}
              pressed={isAwarded}
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
            >
              {awards > 0 ? largeNumberFormat(awards) : undefined}
            </QuaternaryButton>
          </Tooltip>
        )}
      </div>

      <div className="flex items-center gap-2">
        <BookmarkButton
          post={post}
          iconSize={IconSize.Small}
          buttonProps={{
            id: 'bookmark-post-btn',
            pressed: post.bookmarked,
            onClick: onToggleBookmark,
            size: ButtonSize.Small,
          }}
        />
        <Tooltip content="Copy link">
          <Button
            aria-label="Copy link"
            color={ButtonColor.Cabbage}
            icon={<LinkIcon size={IconSize.Small} />}
            onClick={() => onCopyLinkClick?.(post)}
            size={ButtonSize.Small}
            type="button"
            variant={ButtonVariant.Tertiary}
          />
        </Tooltip>
        {post.clickbaitTitleDetected && (
          <PostClickbaitShield post={post} iconOnly />
        )}
        {canSeeAnalytics && (
          <Tooltip content="Analytics">
            <Link
              href={`${webappUrl}posts/${post.id}/analytics`}
              passHref
              prefetch={false}
            >
              <Button
                aria-label="Analytics"
                icon={<AnalyticsIcon size={IconSize.Small} />}
                size={ButtonSize.Small}
                tag="a"
                variant={ButtonVariant.Tertiary}
              />
            </Link>
          </Tooltip>
        )}
        <PostMenuOptions
          post={post}
          origin={Origin.ArticleModal}
          buttonSize={ButtonSize.Small}
        />
        {onClose && (
          <CloseButton size={ButtonSize.Small} onClick={() => onClose()} />
        )}
      </div>
    </div>
  );
};
