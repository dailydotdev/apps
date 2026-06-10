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

// iOS/macOS-style "liquid glass" surface: a consistently dark translucent tint
// (so it reads in both themes over any cover image or content) plus a heavy blur.
const glassSurface = classNames(
  'rounded-12 border border-border-subtlest-tertiary',
  'bg-overlay-primary-pepper text-white shadow-3 backdrop-blur-2xl',
);

// Collapsed "peek": a small left-aligned pill with just the upvote + comment
// counts, so it barely covers the artwork. Non-interactive — clicks fall
// through to the card link. Shown by default on mouse/laptop and hidden while
// hovering; on touch devices it's hidden in favor of the full bar.
const peekClasses = classNames(
  glassSurface,
  'pointer-events-none absolute bottom-2 left-2 z-1 flex items-center gap-3',
  'h-10 px-3.5 tabular-nums typo-footnote',
  'opacity-0 transition-opacity duration-200',
  'laptop:mouse:opacity-100 laptop:mouse:group-hover:opacity-0',
);

// Full bar: spans the full width of the card and spreads every action
// (justify-between, original order) via the shared ActionButtons. `--button-
// default-color` recolors the resting icons to white. On mouse/laptop it's
// clipped to nothing at rest and wipes open from the left on card hover, so the
// peek appears to grow into the full-width bar; on touch it's always shown.
const fullBarClasses = classNames(
  glassSurface,
  'absolute inset-x-2 bottom-2 z-1 flex h-10 items-center px-2.5',
  '[--button-default-color:theme(colors.white)]',
  'transition-[clip-path,opacity] duration-300 ease-out',
  'pointer-events-auto opacity-100 [clip-path:inset(0_0_0_0_round_0.75rem)]',
  'laptop:mouse:pointer-events-none laptop:mouse:opacity-0 laptop:mouse:[clip-path:inset(0_100%_0_0_round_0.75rem)]',
  'laptop:mouse:group-hover:pointer-events-auto laptop:mouse:group-hover:opacity-100 laptop:mouse:group-hover:[clip-path:inset(0_0_0_0_round_0.75rem)]',
);

export function FeedCardGlassActions(props: ActionButtonsProps): ReactElement {
  const { post } = props;

  return (
    <>
      <div className={peekClasses} aria-hidden>
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
        <ActionButtons {...props} className="w-full !px-1 !pb-0" />
      </div>
    </>
  );
}
