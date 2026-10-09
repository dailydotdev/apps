import type { ReactElement } from 'react';
import React from 'react';
import { ElementPlaceholder } from '../../../components/ElementPlaceholder';
import { PlaceholderList } from '../../../components/cards/placeholder/PlaceholderList';
import { ShellPage } from '../../../components/shell/ShellPageContext';
import {
  BodyTextPlaceholder,
  TextPlaceholder,
  TitleTextPlaceholder,
} from '../../../components/widgets/common';
import { shellCoverScrim } from '../../../styles/custom';

// The page's own frame, empty, so nothing moves when the squad arrives. On a
// phone that is the cover model of SquadProfileHeader: the cover under the
// block, the avatar over its edge, the stats, Join, the segments, the first
// cards.
export const SquadPageSkeleton = (): ReactElement => (
  <div
    aria-busy
    aria-label="Loading Squad"
    className="mx-auto flex w-full flex-col laptop:max-w-5xl laptop:flex-row laptop:gap-4 laptop:p-4 laptopL:max-w-6xl"
  >
    <ShellPage transparent />
    <div className="flex min-w-0 flex-1 flex-col border-border-subtlest-tertiary laptop:rounded-16 laptop:border">
      <ElementPlaceholder className="shell-cover -mt-[calc(var(--shell-top,var(--shell-top-rest,0px))+var(--safe-area-top,0px))] h-[calc(10.5rem+var(--safe-area-top,0px))] w-full tablet:mt-0 tablet:h-36 laptop:rounded-t-16">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[calc(6rem+var(--safe-area-top,0px))] tablet:hidden"
          style={{ background: shellCoverScrim }}
        />
      </ElementPlaceholder>
      <div className="flex flex-col px-4 pb-5 tablet:px-6">
        <ElementPlaceholder className="-mt-8 size-20 rounded-full ring-4 ring-background-default tablet:-mt-12 tablet:size-26" />
        <TitleTextPlaceholder className="mt-4 w-48" />
        <BodyTextPlaceholder className="mt-1 w-full max-w-md" />
        <TextPlaceholder className="mt-3 w-32" />
        <div className="mt-4 flex gap-3 border-t border-border-subtlest-tertiary pt-4">
          <TextPlaceholder className="w-24" />
          <TextPlaceholder className="w-16" />
          <TextPlaceholder className="w-16" />
        </div>
        <ElementPlaceholder className="mt-4 h-10 rounded-12 tablet:hidden" />
      </div>
      <div className="flex h-11 items-center gap-1 border-t border-border-subtlest-tertiary px-4 tablet:hidden">
        <ElementPlaceholder className="h-7 w-16 rounded-8" />
        <ElementPlaceholder className="h-7 w-16 rounded-8" />
      </div>
      <div className="grid gap-2 pb-6 pt-4 tablet:hidden">
        <PlaceholderList />
        <PlaceholderList />
      </div>
    </div>
    <div className="hidden w-80 shrink-0 flex-col gap-4 laptop:flex">
      <ElementPlaceholder className="h-40 rounded-16" />
      <ElementPlaceholder className="h-32 rounded-16" />
    </div>
  </div>
);
