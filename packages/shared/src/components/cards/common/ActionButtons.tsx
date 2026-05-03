import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { CardAction } from '../../buttons/CardAction';
import { CardActionBar } from '../../buttons/CardActionBar';
import {
  DiscussIcon as CommentIcon,
  LinkIcon,
  DownvoteIcon,
} from '../../icons';
import { ButtonColor } from '../../buttons/ButtonV2';
import { useFeedPreviewMode } from '../../../hooks';
import { UpvoteButtonIcon } from './UpvoteButtonIcon';
import { BookmarkButton } from '../../buttons';
import { Tooltip } from '../../tooltip/Tooltip';
import PostAwardAction from '../../post/PostAwardAction';
import ConditionalWrapper from '../../ConditionalWrapper';
import { PostTagsPanel } from '../../post/block/PostTagsPanel';
import { LinkWithTooltip } from '../../tooltips/LinkWithTooltip';
import { useCardActions } from '../../../hooks/cards/useCardActions';
import { useBrandSponsorship } from '../../../hooks/useBrandSponsorship';

export type ActionButtonsVariant = 'grid' | 'list' | 'signal';

export interface ActionButtonsProps {
  post: Post;
  onUpvoteClick?: (post: Post) => unknown;
  onCommentClick?: (post: Post) => unknown;
  onBookmarkClick?: (post: Post) => unknown;
  onCopyLinkClick?: (event: React.MouseEvent, post: Post) => unknown;
  className?: string;
  onDownvoteClick?: (post: Post) => unknown;
  /** Controls sizing and behavior. Grid = smaller icons, List = larger icons with link navigation */
  variant?: ActionButtonsVariant;
  showDownvoteAction?: boolean;
  showAwardAction?: boolean;
}

// All three feed-card variants (grid, list, signal) ship at the
// `compact` density per the CardAction width contract — the card
// body lives inside the production 272-340 px clamp and 5+ actions
// at the comfortable 40 px size overflow narrow grid cards.
const FEED_CARD_DENSITY = 'compact';

const variantConfig = {
  grid: {
    containerClassName: 'px-1 pb-1',
    showTagsPanel: false,
    useCommentLink: false,
  },
  list: {
    containerClassName: '',
    showTagsPanel: true,
    useCommentLink: true,
  },
  signal: {
    containerClassName: '',
    showTagsPanel: false,
    useCommentLink: true,
  },
} as const;

const ActionButtons = ({
  post,
  onUpvoteClick,
  onCommentClick,
  onBookmarkClick,
  onCopyLinkClick,
  className,
  onDownvoteClick,
  variant = 'grid',
  showDownvoteAction = true,
  showAwardAction = true,
}: ActionButtonsProps): ReactElement | null => {
  const config = variantConfig[variant];
  const isFeedPreview = useFeedPreviewMode();
  const { getUpvoteAnimation } = useBrandSponsorship();

  const {
    isUpvoteActive,
    isDownvoteActive,
    showTagsPanel,
    onToggleUpvote,
    onToggleDownvote,
    onToggleBookmark,
    onCopyLink,
  } = useCardActions({
    post,
    onUpvoteClick,
    onDownvoteClick,
    onBookmarkClick,
    onCopyLinkClick,
    closeTagsPanelOnUpvote: variant === 'list',
  });

  // Get brand animation config if post has sponsored tags
  const brandAnimation = useMemo(() => {
    const animationResult = getUpvoteAnimation(post.tags || []);
    if (
      !animationResult.shouldAnimate ||
      !animationResult.colors ||
      !animationResult.config
    ) {
      return null;
    }
    return {
      colors: animationResult.colors,
      config: animationResult.config,
      brandLogo: animationResult.brandLogo,
    };
  }, [getUpvoteAnimation, post.tags]);

  if (isFeedPreview) {
    return null;
  }

  const commentCount = post.numComments ?? 0;
  const upvoteCount = post.numUpvotes ?? 0;

  const commentButton = config.useCommentLink ? (
    <LinkWithTooltip
      tooltip={{ content: 'Comment' }}
      href={post.commentsPermalink}
    >
      <CardAction
        id={`post-${post.id}-comment-btn`}
        href={post.commentsPermalink}
        pressed={post.commented}
        density={FEED_CARD_DENSITY}
        icon={<CommentIcon />}
        iconPressed={<CommentIcon secondary />}
        label="Comment"
        count={commentCount}
        color={ButtonColor.BlueCheese}
        onClick={() => onCommentClick?.(post)}
        buttonClassName="pointer-events-auto"
      />
    </LinkWithTooltip>
  ) : (
    <Tooltip content="Comments" side="bottom">
      <CardAction
        id={`post-${post.id}-comment-btn`}
        density={FEED_CARD_DENSITY}
        icon={<CommentIcon />}
        iconPressed={<CommentIcon secondary />}
        label="Comments"
        count={commentCount}
        pressed={post.commented}
        onClick={() => onCommentClick?.(post)}
        color={ButtonColor.BlueCheese}
      />
    </Tooltip>
  );

  const buttons = (
    <div
      className={classNames(
        'flex flex-row items-center justify-between',
        config.containerClassName,
        className,
      )}
    >
      <CardActionBar layout="feedCard">
        <Tooltip
          content={isUpvoteActive ? 'Remove upvote' : 'More like this'}
          side={variant === 'grid' ? 'bottom' : undefined}
        >
          <CardAction
            id={`post-${post.id}-upvote-btn`}
            density={FEED_CARD_DENSITY}
            color={ButtonColor.Avocado}
            pressed={isUpvoteActive}
            onClick={onToggleUpvote}
            icon={<UpvoteButtonIcon brandAnimation={brandAnimation} />}
            iconPressed={
              <UpvoteButtonIcon secondary brandAnimation={brandAnimation} />
            }
            label={isUpvoteActive ? 'Remove upvote' : 'More like this'}
            count={upvoteCount}
            buttonClassName="pointer-events-auto"
          />
        </Tooltip>
        {showDownvoteAction && (
          <Tooltip
            content={isDownvoteActive ? 'Remove downvote' : 'Less like this'}
            side={variant === 'grid' ? 'bottom' : undefined}
          >
            <CardAction
              id={`post-${post.id}-downvote-btn`}
              density={FEED_CARD_DENSITY}
              color={ButtonColor.Ketchup}
              icon={<DownvoteIcon />}
              iconPressed={<DownvoteIcon secondary />}
              label={isDownvoteActive ? 'Remove downvote' : 'Less like this'}
              pressed={isDownvoteActive}
              onClick={onToggleDownvote}
              buttonClassName="pointer-events-auto"
            />
          </Tooltip>
        )}
        {commentButton}
        {showAwardAction && (
          <PostAwardAction post={post} density={FEED_CARD_DENSITY} />
        )}
        <BookmarkButton
          tooltipSide={variant === 'grid' ? 'bottom' : undefined}
          post={post}
          density={FEED_CARD_DENSITY}
          id={`post-${post.id}-bookmark-btn`}
          onClick={onToggleBookmark}
          buttonClassName={classNames(
            variant === 'list' && 'pointer-events-auto',
          )}
        />
        <Tooltip
          content="Copy link"
          side={variant === 'grid' ? 'bottom' : undefined}
        >
          <CardAction
            id="copy-post-btn"
            density={FEED_CARD_DENSITY}
            icon={<LinkIcon />}
            label="Copy link"
            onClick={onCopyLink}
            color={ButtonColor.Cabbage}
            buttonClassName={classNames(
              variant === 'list' && 'pointer-events-auto',
            )}
          />
        </Tooltip>
      </CardActionBar>
    </div>
  );

  // For list variant, optionally wrap with PostTagsPanel
  if (variant === 'list' && config.showTagsPanel) {
    return (
      <ConditionalWrapper
        condition={showTagsPanel}
        wrapper={(children) => (
          <div className="flex flex-col">
            {children}
            <PostTagsPanel post={post} className="pointer-events-auto mt-4" />
          </div>
        )}
      >
        {buttons}
      </ConditionalWrapper>
    );
  }

  return buttons;
};

export default ActionButtons;
