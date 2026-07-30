import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import InteractionCounter from '../../InteractionCounter';
import { QuaternaryButton } from '../../buttons/QuaternaryButton';
import {
  AnalyticsIcon,
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
import { usePostImpressionsModal } from '../../../hooks/post/usePostImpressionsModal';
import { usePostImpressions } from '../../../hooks/post/usePostImpressions';
import { useEngagementBarV2 } from '../../../hooks/useEngagementBarV2';
import ActionButtonsV2 from './ActionButtons.v2';

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

// Sizing follows the floating glass bar (FeedCardGlassActions): XSmall buttons
// with 16px icons, so six actions incl. the impressions counter fit a 272px
// card without the trailing number reaching the edge.
const variantConfig = {
  grid: {
    buttonSize: ButtonSize.XSmall,
    iconSize: IconSize.Size16,
    // Asymmetric like the glass pill: the left edge holds an icon, the right
    // edge holds the impressions number, which needs more room to sit right.
    // `py-1.5` around the h-6 buttons gives the row the same 36px height the
    // bar had at the previous (wider) button size, so shrinking the actions to
    // fit the 272px card doesn't make the bar read as cramped vertically.
    containerClassName: 'py-1.5 pl-1 pr-2.5',
    showTagsPanel: false,
    useCommentLink: false,
  },
  list: {
    buttonSize: ButtonSize.XSmall,
    iconSize: IconSize.Size16,
    containerClassName: '',
    showTagsPanel: true,
    useCommentLink: true,
  },
  signal: {
    buttonSize: ButtonSize.XSmall,
    iconSize: IconSize.Size16,
    containerClassName: '',
    showTagsPanel: false,
    useCommentLink: true,
  },
} as const;

// Monospaced digits so counters never jitter, and a hair of padding on each
// side of the number — both taken from the glass bar.
const counterClassName = 'tabular-nums typo-footnote';
const counterLabelClassName = '!pl-0.5 pr-0.5';

const ActionButtonsV1 = ({
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
  const { buttonSize, iconSize } = config;
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

  const onImpressionsClick = usePostImpressionsModal(post);
  const {
    enabled: impressionsEnabled,
    showImpressions,
    impressions,
  } = usePostImpressions(post);

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
        labelClassName={counterLabelClassName}
        id={`post-${post.id}-comment-btn`}
        className="btn-tertiary-blueCheese pointer-events-auto"
        color={ButtonColor.BlueCheese}
        tag="a"
        href={post.commentsPermalink}
        pressed={post.commented}
        variant={ButtonVariant.Tertiary}
        size={buttonSize}
        icon={<CommentIcon secondary={post.commented} size={iconSize} />}
        onClick={() => onCommentClick?.(post)}
      >
        {commentCount > 0 && (
          <InteractionCounter
            className={classNames(
              counterClassName,
              !commentCount && 'invisible',
            )}
            value={commentCount}
          />
        )}
      </QuaternaryButton>
    </LinkWithTooltip>
  ) : (
    <Tooltip content="Comments" side="bottom">
      <QuaternaryButton
        labelClassName={counterLabelClassName}
        id={`post-${post.id}-comment-btn`}
        icon={<CommentIcon secondary={post.commented} size={iconSize} />}
        pressed={post.commented}
        onClick={() => onCommentClick?.(post)}
        size={buttonSize}
        className="btn-tertiary-blueCheese"
      >
        {commentCount > 0 && (
          <InteractionCounter
            className={classNames(
              counterClassName,
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
          content={isUpvoteActive ? 'Remove upvote' : 'Upvote'}
          side={variant === 'grid' ? 'bottom' : undefined}
        >
          <QuaternaryButton
            labelClassName={counterLabelClassName}
            className="btn-tertiary-avocado pointer-events-auto"
            id={`post-${post.id}-upvote-btn`}
            color={ButtonColor.Avocado}
            pressed={isUpvoteActive}
            onClick={onToggleUpvote}
            variant={ButtonVariant.Tertiary}
            size={buttonSize}
            icon={
              <UpvoteButtonIcon
                secondary={isUpvoteActive}
                size={iconSize}
                brandAnimation={brandAnimation}
              />
            }
          >
            {upvoteCount > 0 && (
              <InteractionCounter
                className={counterClassName}
                value={upvoteCount}
              />
            )}
          </QuaternaryButton>
        </Tooltip>
        {commentButton}
        {showDownvoteAction && (
          <Tooltip
            content={isDownvoteActive ? 'Remove downvote' : 'Downvote'}
            side={variant === 'grid' ? 'bottom' : undefined}
          >
            <QuaternaryButton
              className="pointer-events-auto"
              id={`post-${post.id}-downvote-btn`}
              color={ButtonColor.Ketchup}
              icon={
                <DownvoteIcon secondary={isDownvoteActive} size={iconSize} />
              }
              pressed={isDownvoteActive}
              onClick={onToggleDownvote}
              variant={ButtonVariant.Tertiary}
              size={buttonSize}
            />
          </Tooltip>
        )}
        {/* Impressions take the award slot on feed cards; with the flag off,
            awards stay (unchanged from control). */}
        {showAwardAction && !impressionsEnabled && (
          <PostAwardAction post={post} iconSize={iconSize} />
        )}
        <BookmarkButton
          tooltipSide={variant === 'grid' ? 'bottom' : undefined}
          post={post}
          buttonProps={{
            id: `post-${post.id}-bookmark-btn`,
            onClick: onToggleBookmark,
            size: buttonSize,
            className: classNames(
              'btn-tertiary-bun',
              variant === 'list' && 'pointer-events-auto',
            ),
            ...(variant === 'list' && {
              variant: ButtonVariant.Tertiary,
            }),
          }}
          iconSize={iconSize}
        />
        <Tooltip
          content="Copy link"
          side={variant === 'grid' ? 'bottom' : undefined}
        >
          <QuaternaryButton
            id={`post-${post.id}-copy-btn`}
            size={buttonSize}
            icon={<LinkIcon size={iconSize} />}
            onClick={onCopyLink}
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Cabbage}
            className={variant === 'list' ? 'pointer-events-auto' : undefined}
          />
        </Tooltip>
        {showImpressions && (
          <Tooltip
            content="Impressions"
            side={variant === 'grid' ? 'bottom' : undefined}
          >
            <QuaternaryButton
              labelClassName={counterLabelClassName}
              id={`post-${post.id}-impressions-btn`}
              size={buttonSize}
              icon={<AnalyticsIcon size={iconSize} />}
              onClick={onImpressionsClick}
              variant={ButtonVariant.Tertiary}
              color={ButtonColor.Cheese}
              className={classNames(
                'btn-tertiary-cheese',
                variant === 'list' && 'pointer-events-auto',
              )}
            >
              <InteractionCounter
                className={counterClassName}
                value={impressions}
              />
            </QuaternaryButton>
          </Tooltip>
        )}
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

const ActionButtons = (props: ActionButtonsProps): ReactElement => {
  const useV2 = useEngagementBarV2();
  if (useV2) {
    return <ActionButtonsV2 {...props} />;
  }
  return <ActionButtonsV1 {...props} />;
};

export default ActionButtons;
