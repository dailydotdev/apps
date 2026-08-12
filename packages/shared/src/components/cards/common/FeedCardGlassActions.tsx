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
import { ButtonColor, ButtonVariant } from '../../buttons/Button';
import { Tooltip } from '../../tooltip/Tooltip';
import { useFeedPreviewMode } from '../../../hooks/useFeedPreviewMode';
import { useCardActions } from '../../../hooks/cards/useCardActions';
import { usePostImpressionsModal } from '../../../hooks/post/usePostImpressionsModal';
import { usePostImpressions } from '../../../hooks/post/usePostImpressions';
import {
  actionCounterClassName as countClasses,
  actionCounterLabelClassName as countLabelClasses,
  FEED_ACTION_BUTTON_SIZE,
  FEED_ACTION_ICON_SIZE,
} from './actionCounter';

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
// The pill stays h-10 (its original height) so it reads as a comfortable bar,
// while the buttons themselves are the smaller XSmall size.
// Asymmetric `pl-1 pr-2.5`: the left edge holds the upvote icon while the right
// edge holds the impressions number — a number reads tighter against the edge
// than an icon, so it needs more padding to look optically balanced (per
// jakub.kr "details that make interfaces feel better").
// `feed-card-glass-actions` carries the per-theme fill and the re-toned pressed
// accents — see `styles/components/feedCardGlassActions.css` for the contrast
// reasoning. It has to be a stylesheet rather than utilities here because the
// two themes need genuinely different values, not one expression.
const pillClasses = classNames(
  'feed-card-glass-actions',
  'pointer-events-auto flex h-10 w-full items-center justify-between overflow-hidden pl-1 pr-2.5',
  'rounded-12 border border-border-subtlest-tertiary',
  'text-text-primary backdrop-blur-xl backdrop-saturate-150',
  '[&_.btn-quaternary]:[--button-default-color:var(--theme-text-primary)]',
  '[&_.btn]:[--button-default-color:var(--theme-text-primary)]',
);

export function FeedCardGlassActions({
  post,
  onUpvoteClick,
  onCommentClick,
  onBookmarkClick,
  onCopyLinkClick,
  onDownvoteClick,
  showDownvoteAction = true,
}: ActionButtonsProps): ReactElement | null {
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
  const onImpressionsClick = usePostImpressionsModal(post);
  const { showImpressions, impressions } = usePostImpressions(post);

  if (isFeedPreview) {
    return null;
  }

  const upvoteCount = post.numUpvotes ?? 0;
  const commentCount = post.numComments ?? 0;

  return (
    <div className={outerClasses}>
      <div className={pillClasses}>
        <Tooltip
          content={isUpvoteActive ? 'Remove upvote' : 'Upvote'}
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
            size={FEED_ACTION_BUTTON_SIZE}
            icon={
              <UpvoteButtonIcon
                secondary={isUpvoteActive}
                size={FEED_ACTION_ICON_SIZE}
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
                size={FEED_ACTION_ICON_SIZE}
              />
            }
            pressed={post.commented}
            onClick={() => onCommentClick?.(post)}
            size={FEED_ACTION_BUTTON_SIZE}
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
        {showDownvoteAction && (
          <Tooltip
            content={isDownvoteActive ? 'Remove downvote' : 'Downvote'}
            side="bottom"
          >
            <QuaternaryButton
              className="pointer-events-auto"
              id={`post-${post.id}-downvote-btn`}
              color={ButtonColor.Ketchup}
              icon={
                <DownvoteIcon
                  secondary={isDownvoteActive}
                  size={FEED_ACTION_ICON_SIZE}
                />
              }
              pressed={isDownvoteActive}
              onClick={onToggleDownvote}
              variant={ButtonVariant.Tertiary}
              size={FEED_ACTION_BUTTON_SIZE}
            />
          </Tooltip>
        )}
        <BookmarkButton
          tooltipSide="bottom"
          post={post}
          buttonProps={{
            id: `post-${post.id}-bookmark-btn`,
            onClick: onToggleBookmark,
            size: FEED_ACTION_BUTTON_SIZE,
            className: 'btn-tertiary-bun pointer-events-auto',
          }}
          iconSize={FEED_ACTION_ICON_SIZE}
        />
        <Tooltip content="Copy link" side="bottom">
          <QuaternaryButton
            id={`post-${post.id}-copy-btn`}
            size={FEED_ACTION_BUTTON_SIZE}
            icon={<LinkIcon size={FEED_ACTION_ICON_SIZE} />}
            onClick={onCopyLink}
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Cabbage}
            className="pointer-events-auto"
          />
        </Tooltip>
        {showImpressions && (
          <Tooltip content="Impressions" side="bottom">
            <QuaternaryButton
              labelClassName={countLabelClasses}
              id={`post-${post.id}-impressions-btn`}
              icon={<AnalyticsIcon size={FEED_ACTION_ICON_SIZE} />}
              size={FEED_ACTION_BUTTON_SIZE}
              variant={ButtonVariant.Tertiary}
              color={ButtonColor.Cheese}
              onClick={onImpressionsClick}
              className="btn-tertiary-cheese pointer-events-auto"
            >
              <InteractionCounter
                className={countClasses}
                value={impressions}
              />
            </QuaternaryButton>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
