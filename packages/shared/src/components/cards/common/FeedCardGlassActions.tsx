import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ActionButtonsProps } from './ActionButtons';
import ActionButtons from './ActionButtons';
import InteractionCounter from '../../InteractionCounter';
import { UpvoteIcon, DiscussIcon } from '../../icons';
import { IconSize } from '../../Icon';

// In the glass variant the cover image goes full-bleed: edge-to-edge width
// (drop the side padding), flush to the card's bottom (drop the bottom margin),
// taller so it dominates the card, and bottom corners rounded to the card.
export const glassCoverImageClassName =
  '!h-48 !rounded-t-none !rounded-b-16 !px-0 !mb-0';

// iOS/macOS-style "liquid glass" bar: a consistently dark translucent tint
// (so it reads in both themes over any cover image) plus a heavy backdrop blur.
const glassSurface = classNames(
  'rounded-12 border border-border-subtlest-tertiary',
  'bg-overlay-primary-pepper text-white shadow-3 backdrop-blur-2xl',
);

// Collapsed "peek" state: a small left-aligned pill with just the upvote and
// comment counts, so it barely covers the cover image. Non-interactive — clicks
// fall through to the card link. Shown by default on mouse/laptop and hidden
// while hovering; on touch devices it's hidden in favor of the full bar.
const collapsedClasses = classNames(
  glassSurface,
  'pointer-events-none absolute bottom-2 left-2 z-1 flex items-center gap-2',
  'px-2 py-1 tabular-nums typo-footnote',
  'opacity-0 transition-opacity duration-200',
  'laptop:mouse:opacity-100 laptop:mouse:group-hover:opacity-0',
);

// Full bar: all actions. `--button-default-color` recolors the resting icons to
// white; their pressed/hover brand tints stay bright against the dark glass.
// On mouse/laptop it stays collapsed (hidden + non-interactive) and expands from
// the bottom-left on card hover; on touch devices it's always visible.
const fullBarClasses = classNames(
  glassSurface,
  'absolute inset-x-2 bottom-2 z-1 flex items-center px-0.5',
  '[--button-default-color:theme(colors.white)]',
  'origin-bottom-left transition-[opacity,transform] duration-200',
  'pointer-events-auto opacity-100',
  'laptop:mouse:pointer-events-none laptop:mouse:scale-95 laptop:mouse:opacity-0',
  'laptop:mouse:group-hover:pointer-events-auto laptop:mouse:group-hover:scale-100 laptop:mouse:group-hover:opacity-100',
);

export function FeedCardGlassActions(props: ActionButtonsProps): ReactElement {
  const { post } = props;

  return (
    <>
      <div className={collapsedClasses} aria-hidden>
        <span className="flex items-center gap-1">
          <UpvoteIcon size={IconSize.XSmall} />
          <InteractionCounter value={post.numUpvotes ?? 0} />
        </span>
        <span className="flex items-center gap-1">
          <DiscussIcon size={IconSize.XSmall} />
          <InteractionCounter value={post.numComments ?? 0} />
        </span>
      </div>
      <div className={fullBarClasses}>
        <ActionButtons {...props} className="w-full !px-0 !pb-0" />
      </div>
    </>
  );
}
