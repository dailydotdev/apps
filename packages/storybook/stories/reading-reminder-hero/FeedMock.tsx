import type { ReactElement, ReactNode } from 'react';
import React from 'react';

// The top of the For you feed the hero sits in, so the slot reads at its
// real size. Phones and tablets show the hero inline at the top of the feed
// (Feed.tsx's topContent); laptop moves it to the top-hero strip above the
// floating feed frame (MainLayout.tsx), with the same classes as that strip.

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

const Tabs = (): ReactElement => (
  <div className="mb-3 flex gap-4 text-text-tertiary typo-callout">
    <span className="rounded-10 bg-surface-float px-3 py-1 font-bold text-text-primary">
      For you
    </span>
    <span className="py-1">Happening now</span>
    <span className="py-1">Following</span>
  </div>
);

const Cards = (): ReactElement => (
  <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </div>
);

export const FeedMock = ({
  hero,
  isLaptop = false,
}: {
  hero?: ReactNode;
  /** Puts the hero in the top-hero strip above the feed frame. */
  isLaptop?: boolean;
}): ReactElement => {
  if (isLaptop) {
    return (
      <div className="flex w-full flex-col px-4 pt-3">
        <div className="peer/top-hero mx-4 mb-3 grid grid-cols-1 gap-3 empty:hidden tablet:has-[>:nth-child(2)]:grid-cols-2 laptop:mx-0">
          {hero}
        </div>
        <div className="flex flex-col rounded-24 border border-border-subtlest-quaternary bg-background-default p-0.5">
          <div className="flex flex-col px-6 pt-3">
            <Tabs />
            <Cards />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[64rem] flex-col px-4 pt-3">
      <Tabs />
      {hero}
      <Cards />
    </div>
  );
};
