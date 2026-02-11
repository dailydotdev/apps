import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import InteractionCounter from '../../InteractionCounter';
import { QuaternaryButton } from '../../buttons/QuaternaryButton';
import {
  DiscussIcon as CommentIcon,
  LinkIcon,
  DownvoteIcon,
} from '../../icons';
import { ButtonColor, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { useFeedPreviewMode } from '../../../hooks';
import { UpvoteButtonIcon } from './UpvoteButtonIcon';
import { BookmarkButton } from '../../buttons';
import { IconSize } from '../../Icon';
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

const variantConfig = {
  grid: {
    buttonSize: ButtonSize.Small,
    iconSize: IconSize.XSmall,
    containerClassName: 'px-1 pb-1',
    showTagsPanel: false,
    useCommentLink: false,
  },
  list: {
    buttonSize: ButtonSize.Small,
    iconSize: IconSize.XSmall,
    containerClassName: '',
    showTagsPanel: true,
    useCommentLink: true,
  },
  signal: {
    buttonSize: ButtonSize.Small,
    iconSize: IconSize.XSmall,
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
      <QuaternaryButton
        labelClassName="!pl-0"
        id={`post-${post.id}-comment-btn`}
        className="btn-tertiary-blueCheese pointer-events-auto"
        color={ButtonColor.BlueCheese}
        tag="a"
        href={post.commentsPermalink}
        pressed={post.commented}
        variant={ButtonVariant.Tertiary}
        size={config.buttonSize}
        icon={<CommentIcon secondary={post.commented} size={config.iconSize} />}
        onClick={() => onCommentClick?.(post)}
      >
        {commentCount > 0 && (
          <InteractionCounter
            className={classNames('tabular-nums', !commentCount && 'invisible')}
            value={commentCount}
          />
        )}
      </QuaternaryButton>
    </LinkWithTooltip>
  ) : (
    <Tooltip content="Comments" side="bottom">
      <QuaternaryButton
        labelClassName="!pl-[1px]"
        id={`post-${post.id}-comment-btn`}
        icon={<CommentIcon secondary={post.commented} size={config.iconSize} />}
        pressed={post.commented}
        onClick={() => onCommentClick?.(post)}
        size={config.buttonSize}
        className="btn-tertiary-blueCheese"
      >
        {commentCount > 0 && (
          <InteractionCounter
            className={classNames(
              'tabular-nums !typo-footnote',
              !commentCount && 'invisible',
            )}
            value={commentCount}
          />
        )}
      </QuaternaryButton>
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
      <div className="flex flex-1 items-center justify-between">
        <Tooltip
          content={isUpvoteActive ? 'Remove upvote' : 'More like this'}
          side={variant === 'grid' ? 'bottom' : undefined}
        >
          <QuaternaryButton
            labelClassName={variant === 'grid' ? '!pl-[1px]' : '!pl-0'}
            className="btn-tertiary-avocado pointer-events-auto"
            id={`post-${post.id}-upvote-btn`}
            color={ButtonColor.Avocado}
            pressed={isUpvoteActive}
            onClick={onToggleUpvote}
            variant={ButtonVariant.Tertiary}
            size={config.buttonSize}
            icon={
              <UpvoteButtonIcon
                secondary={isUpvoteActive}
                size={config.iconSize}
                brandAnimation={brandAnimation}
              />
            }
          >
            {upvoteCount > 0 && (
              <InteractionCounter
                className={classNames(
                  'tabular-nums',
                  variant === 'grid' && 'typo-footnote',
                )}
                value={upvoteCount}
              />
            )}
          </QuaternaryButton>
        </Tooltip>
        {showDownvoteAction && (
          <Tooltip
            content={isDownvoteActive ? 'Remove downvote' : 'Less like this'}
            side={variant === 'grid' ? 'bottom' : undefined}
          >
            <QuaternaryButton
              className="pointer-events-auto"
              id={`post-${post.id}-downvote-btn`}
              color={ButtonColor.Ketchup}
              icon={
                <DownvoteIcon
                  secondary={isDownvoteActive}
                  size={config.iconSize}
                />
              }
              pressed={isDownvoteActive}
              onClick={onToggleDownvote}
              variant={ButtonVariant.Tertiary}
              size={config.buttonSize}
            />
          </Tooltip>
        )}
        {commentButton}
        {showAwardAction && (
          <PostAwardAction post={post} iconSize={config.iconSize} />
        )}
        <BookmarkButton
          tooltipSide={variant === 'grid' ? 'bottom' : undefined}
          post={post}
          buttonProps={{
            id: `post-${post.id}-bookmark-btn`,
            onClick: onToggleBookmark,
            size: config.buttonSize,
            className: classNames(
              'btn-tertiary-bun',
              variant === 'list' && 'pointer-events-auto',
            ),
            ...(variant === 'list' && {
              variant: ButtonVariant.Tertiary,
            }),
          }}
          iconSize={config.iconSize}
        />
        <Tooltip
          content="Copy link"
          side={variant === 'grid' ? 'bottom' : undefined}
        >
          <QuaternaryButton
            id="copy-post-btn"
            size={config.buttonSize}
            icon={<LinkIcon size={config.iconSize} />}
            onClick={onCopyLink}
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Cabbage}
            className={variant === 'list' ? 'pointer-events-auto' : undefined}
          />
        </Tooltip>
      </div>
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
