import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { LinkIcon, PlusIcon } from '@dailydotdev/shared/src/components/icons';
import { LeaderboardCard } from '@dailydotdev/shared/src/components/cards/Leaderboard/common';
import { pageMainClassNames } from '@dailydotdev/shared/src/components/layout/PageWrapperLayout';
import type { Source } from '../data';
import { production } from '../data';
import { PageHeader, SourceLogo } from '../kit';

// /sources as it ships at 1440px: ExploreHubHeader with "Suggest new
// source", then SourceTopList's four LeaderboardCards in two columns
// (four only from laptopXL). Rank, logo, name, handle and a copy button
// that shows on hover. There's no search field above phone width.

const List = ({
  title,
  items,
}: {
  title: string;
  items: Source[];
}): ReactElement => (
  <LeaderboardCard>
    <div className="mb-2 flex items-center justify-between gap-2">
      <h3 className="font-bold typo-title3">{title}</h3>
    </div>
    <ol className="flex flex-col gap-1.5 typo-body">
      {items.map((source, index) => (
        <li
          key={source.id}
          className="group/source flex w-full flex-row items-center rounded-8 px-2 hover:bg-accent-pepper-subtler"
        >
          <span className="inline-flex w-14 shrink-0 justify-center tabular-nums text-text-quaternary">
            {index + 1}
          </span>
          <span className="flex min-w-0 flex-shrink items-center p-2">
            <SourceLogo source={source} className="size-8 rounded-full" />
            <span className="ml-2 flex min-w-0 flex-col">
              <span className="truncate font-bold typo-caption1">
                {source.name}
              </span>
              <span className="truncate text-text-tertiary typo-caption2">
                @{source.handle}
              </span>
            </span>
          </span>
          <Button
            type="button"
            aria-label="Copy link"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<LinkIcon />}
            className="ml-auto shrink-0 opacity-0 group-hover/source:opacity-100"
          />
        </li>
      ))}
    </ol>
  </LeaderboardCard>
);

export const Today = (): ReactElement => (
  <>
    <PageHeader className="!py-0" suggest={false}>
      <Button
        type="button"
        icon={<PlusIcon />}
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
      >
        Suggest new source
      </Button>
    </PageHeader>
    <main className={pageMainClassNames}>
      <div className="grid grid-cols-2 gap-6">
        <List title="Trending sources" items={production.trending} />
        <List title="Popular sources" items={production.popular} />
        <List title="Recently added sources" items={production.recent} />
        <List title="Top video sources" items={production.video} />
      </div>
    </main>
  </>
);
