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
import { ButtonColor, ButtonVariant } from '../../buttons/Button';
import { useFeedPreviewMode } from '../../../hooks';
import { UpvoteButtonIcon } from './UpvoteButtonIcon';
import { BookmarkButton } from '../../buttons';
import { Tooltip } from '../../tooltip/Tooltip';
import ConditionalWrapper from '../../ConditionalWrapper';
import { PostTagsPanel } from '../../post/block/PostTagsPanel';
import { LinkWithTooltip } from '../../tooltips/LinkWithTooltip';
import { useCardActions } from '../../../hooks/cards/useCardActions';
import {
  actionCounterClassName as counterClassName,
  actionCounterLabelClassName as counterLabelClassName,
  FEED_ACTION_BUTTON_SIZE,
  FEED_ACTION_ICON_SIZE,
} from './actionCounter';
import { useBrandSponsorship } from '../../../hooks/useBrandSponsorship';
import { usePostImpressions } from '../../../hooks/post/usePostImpressions';
import { useEngagementBarV2 } from '../../../hooks/useEngagementBarV2';
import ActionButtonsV2 from './ActionButtons.v2';
import { useCardSaveOnHover } from '../../../hooks/cards/useCardSaveOnHover';
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
  /** Controls sizing and behavior. Grid = smaller icons, List = larger icons with link navigation */
  variant?: ActionButtonsVariant;
  showDownvoteAction?: boolean;
  /**
   * `card_save_on_hover`: the card renders the bookmark in its header, so the
   * bar leaves it out. Only grid cards that do so pass it; it is ignored when
   * the flag is off.
   */
  bookmarkInHeader?: boolean;
}

const variantConfig = {
  grid: {
    buttonSize: FEED_ACTION_BUTTON_SIZE,
    iconSize: FEED_ACTION_ICON_SIZE,
    // Asymmetric: an icon sits on the left edge and the impressions number on
    // the right, which needs more room to look optically centred.
    containerClassName: 'py-1.5 pl-1 pr-2.5',
    showTagsPanel: false,
    useCommentLink: false,
  },
  list: {
    buttonSize: FEED_ACTION_BUTTON_SIZE,
    iconSize: FEED_ACTION_ICON_SIZE,
    containerClassName: '',
    showTagsPanel: true,
    useCommentLink: true,
  },
  signal: {
    buttonSize: FEED_ACTION_BUTTON_SIZE,
    iconSize: FEED_ACTION_ICON_SIZE,
    containerClassName: '',
    showTagsPanel: false,
    useCommentLink: true,
  },
} as const;

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

  const { showImpressions, impressions, onImpressionsClick } =
    usePostImpressions(post);

  if (isFeedPreview) {
    return null;
  }

  const commentCount = post.numComments ?? 0;
  const upvoteCount = post.numUpvotes ?? 0;

  const commentButton = config.useCommentLink ? (
    <LinkWithTooltip tooltip={{ content: 'Comment' }} href={getPostPath(post)}>
      <QuaternaryButton
        labelClassName={counterLabelClassName}
        id={`post-${post.id}-comment-btn`}
        className="btn-tertiary-blueCheese pointer-events-auto"
        color={ButtonColor.BlueCheese}
        tag="a"
        href={getPostPath(post)}
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

const ActionButtons = (props: ActionButtonsProps): ReactElement | null => {
  const saveOnHover = useCardSaveOnHover();
  const useV2 = useEngagementBarV2();
  const { variant = 'grid', bookmarkInHeader, ...rest } = props;
  // `card_save_on_hover` only changes grid cards: the v2 bar at 32px, without
  // the bookmark when the card shows it in its header. List and signal cards
  // stay at control. Run it in a GrowthBook namespace exclusive with
  // `engagement_bar_v2`; for a user in both, this one wins on grid cards.
  if (saveOnHover && variant === 'grid') {
    return (
      <ActionButtonsV2
        {...rest}
        variant="grid"
        density="compact"
        bookmarkInHeader={bookmarkInHeader}
      />
    );
  }
  if (useV2) {
    return <ActionButtonsV2 {...rest} variant={variant} />;
  }
  return <ActionButtonsV1 {...rest} variant={variant} />;
};

export default ActionButtons;
