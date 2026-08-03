import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

// The glass variant clips this column so the line-clamped title + TLDR can't
// spill behind the floating action pill. That clip is load-bearing, so the 16px
// inset has to be padding *inside* the clipping box instead of margin on it:
// with margin the clip edge lands exactly where the first child starts, and the
// HighlightChip's blurred glow layer - which paints outside the chip's own box -
// gets cut off. Emit exactly one of `mx-4`/`px-4`; classNames has no
// tailwind-merge, so stacking both would leave the winner to CSS source order.
export const FeaturedWideTextContainer = ({
  useGlass,
  children,
}: {
  useGlass?: boolean;
  children: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col',
      useGlass ? 'min-h-0 flex-1 overflow-hidden px-4' : 'mx-4',
    )}
  >
    {children}
  </div>
);
