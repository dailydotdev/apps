import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ActionButtonsProps } from './ActionButtons';
import { UpvoteButtonIcon } from './UpvoteButtonIcon';
import InteractionCounter from '../../InteractionCounter';
import { QuaternaryButton } from '../../buttons/QuaternaryButton';
import { BookmarkButton } from '../../buttons/BookmarkButton';
import {
  AnalyticsIcon,
  DiscussIcon as CommentIcon,
  DownvoteIcon,
  LinkIcon,
} from '../../icons';
import { ButtonColor, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { IconSize } from '../../Icon';
import { Tooltip } from '../../tooltip/Tooltip';
import { useFeedPreviewMode } from '../../../hooks/useFeedPreviewMode';
import { useCardActions } from '../../../hooks/cards/useCardActions';
import { useAuthContext } from '../../../contexts/AuthContext';
import { canViewPostAnalytics } from '../../../lib/user';

// Full-bleed cover: drop side padding/bottom margin and round only the bottom
// corners so the image meets the card edges. Height/crop are untouched.
export const glassCoverImageClassName =
  '!px-0 !mb-0 !rounded-t-none !rounded-b-16';

const outerClasses = 'pointer-events-none absolute inset-x-2 bottom-2 z-1';

// Only the rest color is pinned to text-primary for contrast on the glass;
// hover/pressed colors are left to each `btn-tertiary-*` class so icons keep
// their brand tint on hover, matching the standard ActionButtons.
//
// `justify-between` (matching the standard ActionButtons row) spreads the
// actions evenly across the pill: the icons keep equal gaps and a long counter
// (e.g. 900 upvotes / 900 comments) just grows its own button instead of
// clipping or shoving a neighbour off its mark.
// `px-1` matches the 4px the h-10 pill leaves above/below its h-8 buttons, so
// the padding is equal on all four sides.
const pillClasses = classNames(
  'pointer-events-auto flex h-10 w-full items-center justify-between overflow-hidden px-1',
  'rounded-12 border border-border-subtlest-tertiary',
  'text-text-primary backdrop-blur-xl backdrop-saturate-150',
  '[&_.btn-quaternary]:[--button-default-color:var(--theme-text-primary)]',
  '[&_.btn]:[--button-default-color:var(--theme-text-primary)]',
);

// The glass fill, a few % darker than the bare `bg-blur-bg` token: a low-opacity
// black layer composited over the theme blur colour (kept inline so it stays a
// one-off and doesn't shift the shared token). backdrop-blur/saturate above
// still do the frosting.
const glassBackground =
  'linear-gradient(rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08)), var(--theme-blur-blur-bg)';

// Keep the counter compact: monospaced digits so it never jitters, and a hair
// of padding on each side so six actions (incl. impressions) still fit a narrow
// card without the trailing icon clipping.
const countLabelClasses = '!pl-0.5 pr-0.5';
const countClasses = 'tabular-nums typo-footnote';

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
  coverScrim = false,
}: ActionButtonsProps & { coverScrim?: boolean }): ReactElement | null {
  const isFeedPreview = useFeedPreviewMode();
  const { user } = useAuthContext();
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
  // Impressions come from the feed `views` field and are analytics — only the
  // author (or a team member) may see them, matching the post-page gating.
  const impressions = post.views ?? 0;
  const canSeeImpressions = canViewPostAnalytics({ user, post });

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
        <div className={pillClasses} style={{ background: glassBackground }}>
          <Tooltip
            content={isUpvoteActive ? 'Remove upvote' : 'More like this'}
            side="bottom"
          >
            <QuaternaryButton
              labelClassName={countLabelClasses}
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
                  className={countClasses}
                  value={upvoteCount}
                />
              )}
            </QuaternaryButton>
          </Tooltip>
          <Tooltip content="Comments" side="bottom">
            <QuaternaryButton
              labelClassName={countLabelClasses}
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
                  className={countClasses}
                  value={commentCount}
                />
              )}
            </QuaternaryButton>
          </Tooltip>
          {canSeeImpressions && (
            <Tooltip content="Impressions" side="bottom">
              <QuaternaryButton
                labelClassName={countLabelClasses}
                id={`post-${post.id}-impressions-btn`}
                icon={<AnalyticsIcon size={IconSize.XSmall} />}
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                color={ButtonColor.Cheese}
                className="pointer-events-auto"
              >
                {impressions > 0 && (
                  <InteractionCounter
                    className={countClasses}
                    value={impressions}
                  />
                )}
              </QuaternaryButton>
            </Tooltip>
          )}
          {showDownvoteAction && (
            <Tooltip
              content={isDownvoteActive ? 'Remove downvote' : 'Less like this'}
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
          )}
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
    </>
  );
}
