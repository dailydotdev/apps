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

// In the glass variant the cover image goes full-bleed: edge-to-edge width
// (drop the side padding), flush to the card's bottom (drop the bottom margin),
// taller so it dominates the card, and bottom corners rounded to the card.
export const glassCoverImageClassName =
  '!h-48 !rounded-t-none !rounded-b-16 !px-0 !mb-0';

// iOS/macOS-style "liquid glass" pill: a consistently dark translucent tint (so
// it reads in both themes over any cover image or content) plus a heavy blur.
// `--button-default-color` recolors the resting action icons to white; their
// pressed/hover brand tints stay bright against the dark glass.
const containerClasses = classNames(
  'pointer-events-auto absolute bottom-2 left-2 z-1 flex items-center overflow-hidden',
  'rounded-12 border border-border-subtlest-tertiary px-0.5',
  'bg-overlay-primary-pepper text-white shadow-3 backdrop-blur-2xl',
  '[--button-default-color:theme(colors.white)]',
);

// The secondary actions live in a single grid column that animates its width
// from 0 → content. Because the pill is shrink-to-fit, collapsing this column
// shrinks the whole pill to just the upvote + comment summary; expanding it
// grows the same pill rightward — one component morphing, not a cross-fade.
// Collapsed by default on mouse/laptop and revealed on card hover; on touch
// devices (no hover) it stays open.
const secondaryGroupClasses = classNames(
  'grid transition-[grid-template-columns,opacity] duration-300 ease-out',
  'opacity-100 [grid-template-columns:1fr]',
  'laptop:mouse:opacity-0 laptop:mouse:[grid-template-columns:0fr]',
  'laptop:mouse:group-hover:opacity-100 laptop:mouse:group-hover:[grid-template-columns:1fr]',
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

  if (isFeedPreview) {
    return null;
  }

  const upvoteCount = post.numUpvotes ?? 0;
  const commentCount = post.numComments ?? 0;

  return (
    <div className={containerClasses}>
      <Tooltip
        content={isUpvoteActive ? 'Remove upvote' : 'More like this'}
        side="bottom"
      >
        <QuaternaryButton
          labelClassName="!pl-[1px]"
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
      <Tooltip content="Comments" side="bottom">
        <QuaternaryButton
          labelClassName="!pl-[1px]"
          id={`post-${post.id}-comment-btn`}
          icon={
            <CommentIcon secondary={post.commented} size={IconSize.XSmall} />
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
      <div className={secondaryGroupClasses}>
        <div className="flex min-w-0 items-center overflow-hidden">
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
          {showAwardAction && (
            <PostAwardAction post={post} iconSize={IconSize.XSmall} />
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
    </div>
  );
}
