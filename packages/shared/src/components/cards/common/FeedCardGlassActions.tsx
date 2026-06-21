import type { ReactElement } from 'react';
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

const outerClasses = 'pointer-events-none absolute inset-x-2 bottom-2 z-1';

// Only the rest color is pinned to text-primary for contrast on the glass;
// hover/pressed colors are left to each `btn-tertiary-*` class so icons keep
// their brand tint on hover, matching the standard ActionButtons.
const pillClasses = classNames(
  'pointer-events-auto flex h-10 w-full items-center overflow-hidden px-1',
  'rounded-12 border border-border-subtlest-tertiary',
  'bg-blur-bg text-text-primary backdrop-blur-xl backdrop-saturate-150',
  '[&_.btn-quaternary]:[--button-default-color:var(--theme-text-primary)]',
  '[&_.btn]:[--button-default-color:var(--theme-text-primary)]',
);

// Every action gets an equal-width centered slot so the icons stay evenly spaced
// across the pill regardless of upvote/comment counts widening a button.
const slotClasses = 'flex min-w-0 flex-1 items-center justify-center';

// Dark glow behind the pill so it stays readable over busy cover images. Fixed
// pepper tint in both themes; inline gradient since it's a one-off scrim.
const scrimGradient =
  'radial-gradient(75% 90% at 0% 100%, rgba(14, 18, 23, 0.55) 0%, rgba(14, 18, 23, 0) 70%)';
const scrimClasses =
  'pointer-events-none absolute bottom-0 left-0 z-0 h-24 w-3/5 rounded-bl-16';

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
          <div className={slotClasses}>
            <Tooltip content="Comments" side="bottom">
              <QuaternaryButton
                labelClassName="!pl-[1px] pr-1.5"
                id={`post-${post.id}-comment-btn`}
                icon={
                  <CommentIcon
                    secondary={post.commented}
                    size={IconSize.XSmall}
                  />
                }
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
          </div>
          {showDownvoteAction && (
            <div className={slotClasses}>
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
            </div>
          )}
          {showAwardAction && (
            <div className={slotClasses}>
              <PostAwardAction post={post} iconSize={IconSize.XSmall} />
            </div>
          )}
          <div className={slotClasses}>
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
          </div>
          <div className={slotClasses}>
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
          </div>
        </div>
      </div>
    </>
  );
}
