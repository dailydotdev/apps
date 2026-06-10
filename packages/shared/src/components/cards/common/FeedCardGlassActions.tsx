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

// iOS-26 "Liquid Glass" morph: there is ONE pill containing the real action
// buttons at all times. Anchored actions (upvote always; comment when it has a
// count) sit first and never move or swap; every other action sits in its own
// grid track that animates 0fr ↔ 1fr, so the pill hugs the visible buttons and
// stretches open on hover. Nothing cross-fades over the glass — the surface is
// continuous and the icons materialize inside it.
const morphEase = 'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]';

// Full-width positioning grid: the first track holds the pill, the second is
// an empty spacer. Animating the fr split is what lets the pill go from
// content-hugging (spacer absorbs the rest) to spanning the full card —
// `width: fit-content → 100%` is not animatable, but fr tracks are.
const outerClasses = classNames(
  'pointer-events-none absolute inset-x-2 bottom-2 z-1 grid',
  `transition-[grid-template-columns] ${morphEase}`,
  '[grid-template-columns:1fr_0fr]',
  'laptop:mouse:[grid-template-columns:0fr_1fr]',
  'laptop:mouse:group-hover:[grid-template-columns:1fr_0fr]',
);

// `min-w-fit` keeps the pill floored at its visible content while the outer
// track animates. The glass surface uses the theme-aware `blur-bg` token
// (pepper glass in dark mode, white glass in light mode — both at 64%).
// The `[&_.btn]`/`[&_.btn-quaternary]` descendant pins outrank the
// `btn-tertiary-*` classes that re-declare the color vars per button, keeping
// icons AND counters on text-primary at rest and on hover for maximum
// contrast — only the pressed/active state shows a brand tint.
const pillClasses = classNames(
  'pointer-events-auto flex h-10 min-w-fit items-center justify-between overflow-hidden px-1',
  'rounded-12 border border-border-subtlest-tertiary',
  'bg-blur-bg text-text-primary backdrop-blur-xl backdrop-saturate-150',
  '[&_.btn-quaternary]:[--button-default-color:var(--theme-text-primary)]',
  '[&_.btn-quaternary]:[--button-hover-color:var(--theme-text-primary)]',
  '[&_.btn]:[--button-default-color:var(--theme-text-primary)]',
  '[&_.btn]:[--button-hover-color:var(--theme-text-primary)]',
);

// One collapsible track per secondary action. Width animates 0fr ↔ 1fr while
// the content fades in slightly delayed, so the pill's growth leads and the
// icon settles into place (and focus is removed while hidden via visibility).
const segmentClasses = classNames(
  `grid transition-[grid-template-columns] ${morphEase}`,
  '[grid-template-columns:1fr]',
  'laptop:mouse:[grid-template-columns:0fr]',
  'laptop:mouse:group-hover:[grid-template-columns:1fr]',
);

const segmentContentClasses = classNames(
  'flex min-w-0 items-center justify-center overflow-hidden',
  'transition-[opacity,visibility] duration-200 ease-out',
  'visible opacity-100',
  'laptop:mouse:invisible laptop:mouse:opacity-0',
  'laptop:mouse:group-hover:visible laptop:mouse:group-hover:opacity-100 laptop:mouse:group-hover:delay-75',
);

const Segment = ({ children }: { children: ReactNode }): ReactElement => (
  <div className={segmentClasses}>
    <div className={segmentContentClasses}>{children}</div>
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
        {commentCount > 0 ? commentButton : <Segment>{commentButton}</Segment>}
        {showDownvoteAction && (
          <Segment>
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
          </Segment>
        )}
        {showAwardAction && (
          <Segment>
            <PostAwardAction post={post} iconSize={IconSize.XSmall} />
          </Segment>
        )}
        <Segment>
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
        <Segment>
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
  );
}
