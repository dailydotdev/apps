import type { ReactElement } from 'react';
import React from 'react';
import { ElementPlaceholder } from '../../../components/ElementPlaceholder';

// The page's own frame, empty, so nothing moves when the squad arrives.
export const SquadPageSkeleton = (): ReactElement => (
  <div
    aria-busy
    aria-label="Loading Squad"
    className="mx-auto flex w-full flex-col laptop:max-w-5xl laptop:flex-row laptop:gap-4 laptop:p-4 laptopL:max-w-6xl"
  >
    <div className="flex min-w-0 flex-1 flex-col border-border-subtlest-tertiary laptop:rounded-16 laptop:border">
      <ElementPlaceholder className="h-28 w-full tablet:h-36 laptop:rounded-t-16" />
      <div className="flex flex-col gap-3 px-4 pb-5 tablet:px-6">
        <ElementPlaceholder className="-mt-8 size-20 rounded-full ring-4 ring-background-default tablet:-mt-12 tablet:size-26" />
        <ElementPlaceholder className="h-6 w-48 rounded-12" />
        <ElementPlaceholder className="h-4 w-full max-w-md rounded-12" />
        <ElementPlaceholder className="h-4 w-64 rounded-12" />
      </div>
    </div>
    <div className="hidden w-80 shrink-0 flex-col gap-4 laptop:flex">
      <ElementPlaceholder className="h-40 rounded-16" />
      <ElementPlaceholder className="h-32 rounded-16" />
    </div>
  </div>
);
