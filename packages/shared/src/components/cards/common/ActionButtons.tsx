import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import InteractionCounter from '../../InteractionCounter';
import { QuaternaryButton } from '../../buttons/QuaternaryButton';
import {
  DiscussIcon as CommentIcon,
  DiscussIconV2 as CommentIconV2,
  LinkIcon,
  DownvoteIcon,
} from '../../icons';
import { ButtonColor, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { useFeedPreviewMode } from '../../../hooks';
import { useFeature } from '../../GrowthBookProvider';
import { featureCommentFirstAction } from '../../../lib/featureManagement';
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
  const { getUpvoteAnimation } = useBrandSponsorship();
  // The experiment only reorders the comment action and swaps its icon;
  // copy and click behavior stay identical to the control so the only
  // variable is order.
  const isCommentFirst = useFeature(featureCommentFirstAction);
  const CommentIconComponent = isCommentFirst ? CommentIconV2 : CommentIcon;

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
  // Keep every count in the action row on the same typography as the upvote
  // counter so the numbers match in size/style across variants. `!leading-5`
  // forces the footnote line to fill the counter's h-5 box (it must beat
  // typo-footnote's own line-height, which is emitted later in the same
  // utilities layer) so the digits center against the icons instead of
  // riding high.
  const counterClassName = classNames(
    'tabular-nums !leading-5',
    variant === 'grid' && 'typo-footnote',
  );
  const counterLabelClassName = variant === 'grid' ? '!pl-[1px]' : '!pl-0';

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
        size={config.buttonSize}
        icon={
          <CommentIconComponent
            secondary={post.commented}
            size={config.iconSize}
          />
        }
        onClick={() => onCommentClick?.(post)}
      >
        {commentCount > 0 && (
          <InteractionCounter
            className={counterClassName}
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
        icon={
          <CommentIconComponent
            secondary={post.commented}
            size={config.iconSize}
          />
        }
        pressed={post.commented}
        onClick={() => onCommentClick?.(post)}
        size={config.buttonSize}
        className="btn-tertiary-blueCheese"
      >
        {commentCount > 0 && (
          <InteractionCounter
            className={counterClassName}
            value={commentCount}
          />
        )}
      </QuaternaryButton>
    </Tooltip>
  );

  const voteButtons = (
    <>
      <Tooltip
        content={isUpvoteActive ? 'Remove upvote' : 'More like this'}
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
              className={counterClassName}
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
    </>
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
        {isCommentFirst ? (
          <>
            {commentButton}
            {voteButtons}
          </>
        ) : (
          <>
            {voteButtons}
            {commentButton}
          </>
        )}
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

const ActionButtons = (props: ActionButtonsProps): ReactElement => {
  const useV2 = useEngagementBarV2();
  if (useV2) {
    return <ActionButtonsV2 {...props} />;
  }
  return <ActionButtonsV1 {...props} />;
};

export default ActionButtons;
