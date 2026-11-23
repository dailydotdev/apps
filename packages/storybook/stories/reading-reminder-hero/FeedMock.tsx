import type { ReactElement, ReactNode } from 'react';
import React from 'react';

// The top of the For you feed the hero sits in: tabs, the hero slot, and
// the first row of cards, so the slot reads at its real size.

const SkeletonCard = (): ReactElement => (
  <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
    <div className="flex items-center gap-2">
      <span className="size-6 rounded-full bg-surface-float" />
      <span className="h-3 w-24 rounded-4 bg-surface-float" />
    </div>
    <span className="h-4 w-full rounded-4 bg-surface-float" />
    <span className="h-4 w-2/3 rounded-4 bg-surface-float" />
    <span className="h-32 w-full rounded-12 bg-surface-float" />
  </div>
);

export const FeedMock = ({ hero }: { hero?: ReactNode }): ReactElement => (
  <div className="mx-auto flex w-full max-w-[64rem] flex-col px-4 pt-3 laptop:px-8">
    <div className="mb-3 flex gap-4 text-text-tertiary typo-callout">
      <span className="rounded-10 bg-surface-float px-3 py-1 font-bold text-text-primary">
        For you
      </span>
      <span className="py-1">Happening now</span>
      <span className="py-1">Following</span>
    </div>
    {hero}
    <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);
