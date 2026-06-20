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
const pillClasses = classNames(
  'pointer-events-auto flex h-10 min-w-fit items-center overflow-hidden px-1',
  'rounded-12 border border-border-subtlest-tertiary',
  'bg-blur-bg text-text-primary backdrop-blur-xl backdrop-saturate-150',
  '[&_.btn-quaternary]:[--button-default-color:var(--theme-text-primary)]',
  '[&_.btn]:[--button-default-color:var(--theme-text-primary)]',
);

// Every action sits in an equal-width slot with its content centered, so the
// icons stay evenly spaced across the full-width pill no matter how wide the
// upvote/comment counts make any single button.
const slotClasses = 'flex min-w-0 flex-1 items-center justify-center';

// Secondary-action slot. Base (and the always-expanded variant) keeps it
// equal-width and visible; the collapse classes shrink it to zero width on
// desktop until hover. `visibility` removes hidden buttons from focus order.
const segmentBaseClasses = classNames(slotClasses, 'overflow-hidden');
const segmentCollapseClasses = classNames(
  'laptop:mouse:w-0 laptop:mouse:flex-none',
  'laptop:mouse:group-hover:w-auto laptop:mouse:group-hover:flex-1',
);

const segmentContentBaseClasses =
  'flex min-w-0 items-center justify-center overflow-hidden';
const segmentContentCollapseClasses = classNames(
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
  expanded = false,
}: ActionButtonsProps & {
  coverScrim?: boolean;
  expanded?: boolean;
}): ReactElement | null {
  const isFeedPreview = useFeedPreviewMode();
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

  const outerClasses = classNames(
    outerBaseClasses,
    !expanded && outerCollapseClasses,
  );
  const segmentProps = {
    wrapperClassName: classNames(
      segmentBaseClasses,
      !expanded && segmentCollapseClasses,
    ),
    contentClassName: classNames(
      segmentContentBaseClasses,
      !expanded && segmentContentCollapseClasses,
    ),
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
          <div className={slotClasses}>
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
            <div className={slotClasses}>{commentButton}</div>
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
