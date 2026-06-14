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
import { useIsScrolling } from '../../../hooks/useIsScrolling';

// Full-bleed cover for the glass variant: drop the side padding and bottom
// margin so the image meets the card's left/right/bottom edges, and round the
// bottom corners to the card. Height and object-cover are untouched — same
// crop and aspect, just edge-to-edge instead of inset.
export const glassCoverImageClassName =
  '!px-0 !mb-0 !rounded-t-none !rounded-b-16';

// iOS-26 "Liquid Glass" morph: there is ONE pill containing the real action
// buttons at all times. Anchored actions (upvote always; comment when it has a
// count) sit first and never move or swap; every other action sits in its own
// grid track that animates 0fr ↔ 1fr, so the pill hugs the visible buttons and
// stretches open on hover. Nothing cross-fades over the glass — the surface is
// continuous and the icons materialize inside it.
const morphEase =
  'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none';

// Full-width positioning grid: the first track holds the pill, the second is
// an empty spacer. Animating the fr split is what lets the pill go from
// content-hugging (spacer absorbs the rest) to spanning the full card —
// `width: fit-content → 100%` is not animatable, but fr tracks are. The
// `group-hover` expansion is appended by the component only when the feed
// isn't scrolling (see `expandOnHover`), so cards expand on a resting hover but
// never mid-scroll — no hover-intent delay, the expand is immediate.
const outerBaseClasses = classNames(
  'pointer-events-none absolute inset-x-2 bottom-2 z-1 grid',
  `transition-[grid-template-columns] ${morphEase}`,
  '[grid-template-columns:1fr_0fr]',
  'laptop:mouse:[grid-template-columns:0fr_1fr]',
);
const outerExpandClasses =
  'laptop:mouse:group-hover:[grid-template-columns:1fr_0fr]';

// `min-w-fit` keeps the pill floored at its visible content while the outer
// track animates. The glass surface uses the theme-aware `blur-bg` token
// (pepper glass in dark mode, white glass in light mode — both at 64%).
// Only the REST color is pinned to text-primary (`--button-default-color`) for
// max contrast on the glass; the hover/pressed colors are left to each
// `btn-tertiary-*` class so the icon AND its counter turn the action's brand
// tint on hover (avocado for upvote, blueCheese for comment, etc.), matching
// the standard ActionButtons.
const pillClasses = classNames(
  'pointer-events-auto flex h-10 min-w-fit items-center justify-between overflow-hidden px-1',
  'rounded-12 border border-border-subtlest-tertiary',
  'bg-blur-bg text-text-primary backdrop-blur-xl backdrop-saturate-150',
  '[&_.btn-quaternary]:[--button-default-color:var(--theme-text-primary)]',
  '[&_.btn]:[--button-default-color:var(--theme-text-primary)]',
);

// One collapsible track per secondary action. Width animates 0fr ↔ 1fr while
// the content fades in, so the pill's growth leads and the icon settles into
// place (and focus is removed while hidden via visibility).
const segmentBaseClasses = classNames(
  `grid transition-[grid-template-columns] ${morphEase}`,
  '[grid-template-columns:1fr]',
  'laptop:mouse:[grid-template-columns:0fr]',
);
const segmentExpandClasses =
  'laptop:mouse:group-hover:[grid-template-columns:1fr]';

const segmentContentBaseClasses = classNames(
  'flex min-w-0 items-center justify-center overflow-hidden',
  'transition-[opacity,visibility] duration-200 ease-out motion-reduce:transition-none',
  'visible opacity-100',
  'laptop:mouse:invisible laptop:mouse:opacity-0',
);
const segmentContentExpandClasses =
  'laptop:mouse:group-hover:visible laptop:mouse:group-hover:opacity-100';

// Soft dark glow anchored at the cover's bottom-left, behind the pill, so the
// glass bar stays readable over busy/noisy cover images instead of getting lost
// in the detail. A fixed dark pepper tint (consistent in both themes, matching
// the media-overlay guidance) that fades out quickly so it's localized to the
// corner. Inline gradient (no Tailwind color class) keeps it a one-off scrim.
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
  const isScrolling = useIsScrolling();
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

  // Only attach the hover-expand utilities when the feed isn't scrolling, so a
  // card passing under the cursor mid-scroll can't fire the expand animation —
  // the grid simply stays collapsed regardless of hover. When scrolling stops,
  // a genuinely hovered card expands (after the intent delay).
  const expandOnHover = !isScrolling;
  const outerClasses = classNames(
    outerBaseClasses,
    expandOnHover && outerExpandClasses,
  );
  const segmentClasses = classNames(
    segmentBaseClasses,
    expandOnHover && segmentExpandClasses,
  );
  const segmentContentClasses = classNames(
    segmentContentBaseClasses,
    expandOnHover && segmentContentExpandClasses,
  );
  const segmentProps = {
    wrapperClassName: segmentClasses,
    contentClassName: segmentContentClasses,
  };

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
