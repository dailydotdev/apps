import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ActionButtonsProps } from './ActionButtons';
import { UpvoteButtonIcon } from './UpvoteButtonIcon';
import InteractionCounter from '../../InteractionCounter';
import { QuaternaryButton } from '../../buttons/QuaternaryButton';
import { BookmarkButton } from '../../buttons/BookmarkButton';
import PostAwardAction from '../../post/PostAwardAction';
import {
  DiscussIcon as CommentIcon,
  DownvoteIcon,
  LinkIcon,
} from '../../icons';
import { ButtonColor, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { IconSize } from '../../Icon';
import { Tooltip } from '../../tooltip/Tooltip';
import { useFeedPreviewMode } from '../../../hooks/useFeedPreviewMode';
import { useCardActions } from '../../../hooks/cards/useCardActions';
import { useGlassActionsExpanded } from '../../../hooks/useGlassActionsExpanded';

// Full-bleed cover: drop side padding/bottom margin and round only the bottom
// corners so the image meets the card edges. Height/crop are untouched.
export const glassCoverImageClassName =
  '!px-0 !mb-0 !rounded-t-none !rounded-b-16';

// Positioning grid: track 1 holds the pill, track 2 is a spacer. Base keeps the
// pill full width (the always-expanded variant); the collapse classes (compact
// mode) shrink it to content width on desktop until the card is hovered. No
// transition so it flips instantly.
const outerBaseClasses =
  'pointer-events-none absolute inset-x-2 bottom-2 z-1 grid [grid-template-columns:1fr_0fr]';
const outerCollapseClasses = classNames(
  'laptop:mouse:[grid-template-columns:0fr_1fr]',
  'laptop:mouse:group-hover:[grid-template-columns:1fr_0fr]',
);

// Only the rest color is pinned to text-primary for contrast on the glass;
// hover/pressed colors are left to each `btn-tertiary-*` class so icons keep
// their brand tint on hover, matching the standard ActionButtons.
const pillBaseClasses = classNames(
  'pointer-events-auto flex h-10 min-w-fit items-center overflow-hidden px-1',
  'rounded-12 border border-border-subtlest-tertiary',
  'bg-blur-bg text-text-primary backdrop-blur-xl backdrop-saturate-150',
  '[&_.btn-quaternary]:[--button-default-color:var(--theme-text-primary)]',
  '[&_.btn]:[--button-default-color:var(--theme-text-primary)]',
);

// Compact (hover-to-reveal) mode: `justify-between` spreads the actions across
// the pill and anchors the ends, so the upvote stays put when the pill expands
// on hover (no layout shift). `gap-1` keeps a minimum spacing when the pill is
// content-width (only the upvote showing).
const pillCompactClasses = 'justify-between gap-1';

// Always-expanded variant: every action gets an equal-width slot with its
// content centered, so the icons are evenly spaced across the pill regardless of
// upvote/comment counts. There's no hover here, so equal slots can't cause a
// shift.
const evenSlotClasses = 'flex min-w-0 flex-1 items-center justify-center';

// Compact secondary action: one collapsible grid track that is content-width and
// visible at rest, collapsed to zero width on desktop until the card is hovered.
// No transition so it flips instantly. `visibility` drops hidden buttons from
// the focus order.
const segmentCompactClasses = classNames(
  'grid [grid-template-columns:1fr]',
  'laptop:mouse:[grid-template-columns:0fr]',
  'laptop:mouse:group-hover:[grid-template-columns:1fr]',
);

const segmentContentBaseClasses =
  'flex min-w-0 items-center justify-center overflow-hidden';
const segmentContentCompactClasses = classNames(
  segmentContentBaseClasses,
  'laptop:mouse:invisible',
  'laptop:mouse:group-hover:visible',
);

// Dark glow behind the pill so it stays readable over busy cover images. Fixed
// pepper tint in both themes; inline gradient since it's a one-off scrim.
const scrimGradient =
  'radial-gradient(75% 90% at 0% 100%, rgba(14, 18, 23, 0.55) 0%, rgba(14, 18, 23, 0) 70%)';
const scrimClasses =
  'pointer-events-none absolute bottom-0 left-0 z-0 h-24 w-3/5 rounded-bl-16';

interface SegmentProps {
  children: ReactNode;
  wrapperClassName: string;
  contentClassName: string;
}

const Segment = ({
  children,
  wrapperClassName,
  contentClassName,
}: SegmentProps): ReactElement => (
  <div className={wrapperClassName}>
    <div className={contentClassName}>{children}</div>
  </div>
);

export function FeedCardGlassActions({
  post,
  onUpvoteClick,
  onCommentClick,
  onBookmarkClick,
  onCopyLinkClick,
  onDownvoteClick,
  showDownvoteAction = true,
  showAwardAction = true,
  coverScrim = false,
}: ActionButtonsProps & {
  coverScrim?: boolean;
}): ReactElement | null {
  const isFeedPreview = useFeedPreviewMode();
  // Read the per-device "always show actions" preference here so every card type
  // that renders this bar respects the feed-header toggle without threading a
  // prop through each card component.
  const [expanded] = useGlassActionsExpanded();
  const {
    isUpvoteActive,
    isDownvoteActive,
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
  });

  if (isFeedPreview) {
    return null;
  }

  const pillClasses = classNames(
    pillBaseClasses,
    !expanded && pillCompactClasses,
  );
  const outerClasses = classNames(
    outerBaseClasses,
    !expanded && outerCollapseClasses,
  );
  // In the expanded variant every action is an equal-width slot; in compact mode
  // the always-visible upvote/comment stay direct flex children (`contents`) so
  // `justify-between` anchors them, and secondaries use the collapsible grid.
  const alwaysWrapperClass = expanded ? evenSlotClasses : 'contents';
  const segmentProps = expanded
    ? {
        wrapperClassName: classNames(evenSlotClasses, 'overflow-hidden'),
        contentClassName: segmentContentBaseClasses,
      }
    : {
        wrapperClassName: segmentCompactClasses,
        contentClassName: segmentContentCompactClasses,
      };

  const upvoteCount = post.numUpvotes ?? 0;
  const commentCount = post.numComments ?? 0;

  const commentButton = (
    <Tooltip content="Comments" side="bottom">
      <QuaternaryButton
        labelClassName="!pl-[1px] pr-1.5"
        id={`post-${post.id}-comment-btn`}
        icon={<CommentIcon secondary={post.commented} size={IconSize.XSmall} />}
        pressed={post.commented}
        onClick={() => onCommentClick?.(post)}
        size={ButtonSize.Small}
        className="btn-tertiary-blueCheese pointer-events-auto"
      >
        {commentCount > 0 && (
          <InteractionCounter
            className="tabular-nums !typo-footnote"
            value={commentCount}
          />
        )}
      </QuaternaryButton>
    </Tooltip>
  );

  return (
    <>
      {coverScrim && (
        <div
          aria-hidden
          className={scrimClasses}
          style={{ background: scrimGradient }}
        />
      )}
      <div className={outerClasses}>
        <div className={pillClasses}>
          <div className={alwaysWrapperClass}>
            <Tooltip
              content={isUpvoteActive ? 'Remove upvote' : 'More like this'}
              side="bottom"
            >
              <QuaternaryButton
                labelClassName="!pl-[1px] pr-1.5"
                className="btn-tertiary-avocado pointer-events-auto"
                id={`post-${post.id}-upvote-btn`}
                color={ButtonColor.Avocado}
                pressed={isUpvoteActive}
                onClick={onToggleUpvote}
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={
                  <UpvoteButtonIcon
                    secondary={isUpvoteActive}
                    size={IconSize.XSmall}
                  />
                }
              >
                {upvoteCount > 0 && (
                  <InteractionCounter
                    className="tabular-nums typo-footnote"
                    value={upvoteCount}
                  />
                )}
              </QuaternaryButton>
            </Tooltip>
          </div>
          {commentCount > 0 ? (
            <div className={alwaysWrapperClass}>{commentButton}</div>
          ) : (
            <Segment {...segmentProps}>{commentButton}</Segment>
          )}
          {showDownvoteAction && (
            <Segment {...segmentProps}>
              <Tooltip
                content={
                  isDownvoteActive ? 'Remove downvote' : 'Less like this'
                }
                side="bottom"
              >
                <QuaternaryButton
                  className="pointer-events-auto"
                  id={`post-${post.id}-downvote-btn`}
                  color={ButtonColor.Ketchup}
                  icon={
                    <DownvoteIcon
                      secondary={isDownvoteActive}
                      size={IconSize.XSmall}
                    />
                  }
                  pressed={isDownvoteActive}
                  onClick={onToggleDownvote}
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                />
              </Tooltip>
            </Segment>
          )}
          {showAwardAction && (
            <Segment {...segmentProps}>
              <PostAwardAction post={post} iconSize={IconSize.XSmall} />
            </Segment>
          )}
          <Segment {...segmentProps}>
            <BookmarkButton
              tooltipSide="bottom"
              post={post}
              buttonProps={{
                id: `post-${post.id}-bookmark-btn`,
                onClick: onToggleBookmark,
                size: ButtonSize.Small,
                className: 'btn-tertiary-bun pointer-events-auto',
              }}
              iconSize={IconSize.XSmall}
            />
          </Segment>
          <Segment {...segmentProps}>
            <Tooltip content="Copy link" side="bottom">
              <QuaternaryButton
                id="copy-post-btn"
                size={ButtonSize.Small}
                icon={<LinkIcon size={IconSize.XSmall} />}
                onClick={onCopyLink}
                variant={ButtonVariant.Tertiary}
                color={ButtonColor.Cabbage}
                className="pointer-events-auto"
              />
            </Tooltip>
          </Segment>
        </div>
        <div aria-hidden />
      </div>
    </>
  );
}
