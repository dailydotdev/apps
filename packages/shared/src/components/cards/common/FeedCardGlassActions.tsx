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

const morphEase =
  'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none';

// Positioning grid: track 1 holds the pill, track 2 is a spacer. Animating the
// fr split expands the pill from content-hugging to full width on hover —
// `fit-content → 100%` isn't animatable, but fr tracks are.
const outerClasses = classNames(
  'pointer-events-none absolute inset-x-2 bottom-2 z-1 grid',
  `transition-[grid-template-columns] ${morphEase}`,
  '[grid-template-columns:1fr_0fr]',
  'laptop:mouse:[grid-template-columns:0fr_1fr]',
  'laptop:mouse:group-hover:[grid-template-columns:1fr_0fr]',
);

// Only the rest color is pinned to text-primary for contrast on the glass;
// hover/pressed colors are left to each `btn-tertiary-*` class so icons keep
// their brand tint on hover, matching the standard ActionButtons.
const pillClasses = classNames(
  'pointer-events-auto flex h-10 min-w-fit items-center justify-between overflow-hidden px-1',
  'rounded-12 border border-border-subtlest-tertiary',
  'bg-blur-bg text-text-primary backdrop-blur-xl backdrop-saturate-150',
  '[&_.btn-quaternary]:[--button-default-color:var(--theme-text-primary)]',
  '[&_.btn]:[--button-default-color:var(--theme-text-primary)]',
);

// One collapsible track per secondary action: width animates 0fr ↔ 1fr on hover
// while the content fades in. `visibility` removes hidden buttons from focus order.
const segmentClasses = classNames(
  `grid transition-[grid-template-columns] ${morphEase}`,
  '[grid-template-columns:1fr]',
  'laptop:mouse:[grid-template-columns:0fr]',
  'laptop:mouse:group-hover:[grid-template-columns:1fr]',
);

const segmentContentClasses = classNames(
  'flex min-w-0 items-center justify-center overflow-hidden',
  'transition-[opacity,visibility] duration-200 ease-out motion-reduce:transition-none',
  'visible opacity-100',
  'laptop:mouse:invisible laptop:mouse:opacity-0',
  'laptop:mouse:group-hover:visible laptop:mouse:group-hover:opacity-100',
);

const segmentProps = {
  wrapperClassName: segmentClasses,
  contentClassName: segmentContentClasses,
};

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
}: ActionButtonsProps & { coverScrim?: boolean }): ReactElement | null {
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
          {commentCount > 0 ? (
            commentButton
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
