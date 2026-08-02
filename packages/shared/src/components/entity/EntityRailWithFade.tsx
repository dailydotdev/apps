import type { ReactElement, ReactNode } from 'react';
import React from 'react';

export const EntityRailWithFade = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  // w-full matters: inside a `flex-col items-start` page (BaseFeedPage) a
  // width-less wrapper shrinks to its content, so the horizontal feed grid
  // resolves its percentage-based auto-columns against its own intrinsic
  // width and the cards blow up to ~2x size.
  <div className="relative mb-10 w-full">
    {children}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-background-default"
    />
  </div>
);
