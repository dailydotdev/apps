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

// One iOS-style "liquid glass" pill that breathes: a single element whose
// max-width animates from a compact cap to 100% on card hover. The border,
// tint and blur belong to this one element, so nothing cross-fades or shifts —
// the pill itself grows. `w-full` + animated `max-width` is the trick: you
// can't transition `width: fit-content → 100%`, but length ↔ percentage
// max-width interpolates smoothly.
// On touch devices (no hover) the pill is always fully expanded.
const pillClasses = classNames(
  'relative flex h-10 w-full items-center overflow-hidden',
  'rounded-12 border border-border-subtlest-tertiary',
  'bg-overlay-primary-pepper text-white backdrop-blur-2xl',
  '[--button-default-color:theme(colors.white)] [--button-hover-color:theme(colors.white)]',
  'transition-[max-width] duration-300 ease-out',
  'pointer-events-auto max-w-full',
  'laptop:mouse:pointer-events-none laptop:mouse:max-w-[8.5rem]',
  'laptop:mouse:group-hover:pointer-events-auto laptop:mouse:group-hover:max-w-full',
);

// Collapsed content: upvote + comment counts, absolutely layered inside the
// pill so it never affects geometry. Fades out quickly as the pill grows.
const peekLayerClasses = classNames(
  'absolute inset-y-0 left-0 z-1 flex items-center gap-2.5 px-2.5',
  'tabular-nums typo-footnote',
  'opacity-0 transition-opacity duration-150 ease-out',
  'laptop:mouse:opacity-100 laptop:mouse:group-hover:opacity-0',
);

// Expanded content: the standard full-width action row. Its width tracks the
// pill every frame, so justify-between redistributes the icons continuously
// while the pill grows — the "breathing" motion. Fades in slightly delayed so
// the growth leads and the icons settle into place.
const actionsLayerClasses = classNames(
  'flex w-full items-center px-1.5',
  'transition-opacity duration-200 ease-out',
  'opacity-100',
  'laptop:mouse:opacity-0 laptop:mouse:group-hover:opacity-100 laptop:mouse:group-hover:delay-75',
);

export function FeedCardGlassActions(props: ActionButtonsProps): ReactElement {
  const { post } = props;

  return (
    <div className="pointer-events-none absolute inset-x-2 bottom-2 z-1 flex">
      <div className={pillClasses}>
        <div className={peekLayerClasses} aria-hidden>
          <span className="flex items-center gap-1">
            <UpvoteIcon size={IconSize.XSmall} />
            <InteractionCounter value={post.numUpvotes ?? 0} />
          </span>
          <span className="flex items-center gap-1">
            <DiscussIcon size={IconSize.XSmall} />
            <InteractionCounter value={post.numComments ?? 0} />
          </span>
        </div>
        <div className={actionsLayerClasses}>
          <ActionButtons {...props} className="w-full !px-0 !pb-0" />
        </div>
      </div>
    </div>
  );
}
