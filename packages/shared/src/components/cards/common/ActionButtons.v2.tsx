import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { CardAction } from '../../buttons/CardAction';
import type { CardActionDensity } from '../../buttons/CardAction';
import { CardActionBar } from '../../buttons/CardActionBar';
import {
  AnalyticsIcon,
  DiscussIcon as CommentIcon,
  LinkIcon,
  DownvoteIcon,
} from '../../icons';
import { ButtonColor } from '../../buttons/ButtonV2';
import { useFeedPreviewMode } from '../../../hooks';
import { UpvoteButtonIcon } from './UpvoteButtonIcon';
import { BookmarkButton } from '../../buttons/BookmarkButton.v2';
import { Tooltip } from '../../tooltip/Tooltip';
import ConditionalWrapper from '../../ConditionalWrapper';
import { PostTagsPanel } from '../../post/block/PostTagsPanel';
import { LinkWithTooltip } from '../../tooltips/LinkWithTooltip';
import { useCardActions } from '../../../hooks/cards/useCardActions';
import { useBrandSponsorship } from '../../../hooks/useBrandSponsorship';
import { usePostImpressions } from '../../../hooks/post/usePostImpressions';
import { getPostPath } from '../../../lib/links';

export type ActionButtonsVariant = 'grid' | 'list' | 'signal';

export interface ActionButtonsProps {
  post: Post;
  onUpvoteClick?: (post: Post) => unknown;
  onCommentClick?: (post: Post) => unknown;
  onBookmarkClick?: (post: Post) => unknown;
  onCopyLinkClick?: (event: React.MouseEvent, post: Post) => unknown;
  className?: string;
  onDownvoteClick?: (post: Post) => unknown;
  variant?: ActionButtonsVariant;
  showDownvoteAction?: boolean;
  /**
   * Button size. `tight` (24px) is the feed default; `card_save_on_hover`
   * renders grid cards at `compact` (32px).
   */
  density?: CardActionDensity;
  /** The card renders the bookmark in its header, so the bar leaves it out. */
  bookmarkInHeader?: boolean;
}

// `py-1.5` holds the grid row at 36px around 24px buttons; `py-0.5` does the
// same around 32px ones, so cards keep their height at either size.
const gridContainerClassName: Partial<Record<CardActionDensity, string>> = {
  compact: 'px-2 py-0.5',
};

const variantConfig = {
  grid: {
    // Matches the v1 bar: `py-1.5` holds the row at 36px around the h-6
    // buttons, and the wider right edge gives the trailing number room.
    containerClassName: 'py-1.5 pl-1 pr-2.5',
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
  density = 'tight',
  bookmarkInHeader = false,
}: ActionButtonsProps): ReactElement | null => {
  const config = variantConfig[variant];
  const containerClassName =
    (variant === 'grid' && gridContainerClassName[density]) ||
    config.containerClassName;
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

  const { showImpressions, impressions, onImpressionsClick } =
    usePostImpressions(post);

  if (isFeedPreview) {
    return null;
  }

  const commentCount = post.numComments ?? 0;
  const upvoteCount = post.numUpvotes ?? 0;

  const commentButton = config.useCommentLink ? (
    <LinkWithTooltip tooltip={{ content: 'Comment' }} href={getPostPath(post)}>
      <CardAction
        id={`post-${post.id}-comment-btn`}
        href={getPostPath(post)}
        pressed={post.commented}
        density={density}
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
        density={density}
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
        containerClassName,
        className,
      )}
    >
      <CardActionBar layout="feedCard">
        <Tooltip
          content={isUpvoteActive ? 'Remove upvote' : 'Upvote'}
          side={variant === 'grid' ? 'bottom' : undefined}
        >
          <CardAction
            id={`post-${post.id}-upvote-btn`}
            density={density}
            color={ButtonColor.Avocado}
            pressed={isUpvoteActive}
            onClick={onToggleUpvote}
            icon={<UpvoteButtonIcon brandAnimation={brandAnimation} />}
            iconPressed={
              <UpvoteButtonIcon secondary brandAnimation={brandAnimation} />
            }
            label={isUpvoteActive ? 'Remove upvote' : 'Upvote'}
            count={upvoteCount}
            buttonClassName="pointer-events-auto"
          />
        </Tooltip>
        {commentButton}
        {showDownvoteAction && (
          <Tooltip
            content={isDownvoteActive ? 'Remove downvote' : 'Downvote'}
            side={variant === 'grid' ? 'bottom' : undefined}
          >
            <CardAction
              id={`post-${post.id}-downvote-btn`}
              density={density}
              color={ButtonColor.Ketchup}
              icon={<DownvoteIcon />}
              iconPressed={<DownvoteIcon secondary />}
              label={isDownvoteActive ? 'Remove downvote' : 'Downvote'}
              pressed={isDownvoteActive}
              onClick={onToggleDownvote}
              buttonClassName="pointer-events-auto"
            />
          </Tooltip>
        )}
        {!bookmarkInHeader && (
          <BookmarkButton
            tooltipSide={variant === 'grid' ? 'bottom' : undefined}
            post={post}
            density={density}
            id={`post-${post.id}-bookmark-btn`}
            onClick={onToggleBookmark}
            buttonClassName={classNames(
              variant === 'list' && 'pointer-events-auto',
            )}
          />
        )}
        <Tooltip
          content="Copy link"
          side={variant === 'grid' ? 'bottom' : undefined}
        >
          <CardAction
            id={`post-${post.id}-copy-btn`}
            density={density}
            icon={<LinkIcon />}
            label="Copy link"
            onClick={onCopyLink}
            color={ButtonColor.Cabbage}
            buttonClassName={classNames(
              variant === 'list' && 'pointer-events-auto',
            )}
          />
        </Tooltip>
        {showImpressions && (
          <Tooltip
            content="Impressions"
            side={variant === 'grid' ? 'bottom' : undefined}
          >
            <CardAction
              id={`post-${post.id}-impressions-btn`}
              density={density}
              icon={<AnalyticsIcon />}
              label="Impressions"
              count={impressions}
              onClick={onImpressionsClick}
              color={ButtonColor.Cheese}
              buttonClassName={classNames(
                variant === 'list' && 'pointer-events-auto',
              )}
            />
          </Tooltip>
        )}
      </CardActionBar>
    </div>
  );

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
