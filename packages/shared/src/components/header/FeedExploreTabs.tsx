import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '../squads/layout/SquadDirectoryNavbar';
import { Dropdown } from '../fields/Dropdown';
import { CalendarIcon } from '../icons';
import { IconSize } from '../Icon';
import { ExploreTabs, urlToTab } from './FeedExploreHeader';
import { QueryStateKeys, useQueryState } from '../../hooks/utils/useQueryState';
import { periodTexts } from '../layout/common';

const sortsWithPeriod: ExploreTabs[] = [
  ExploreTabs.MostUpvoted,
  ExploreTabs.BestDiscussions,
];

// Explore sort tabs rendered with the same pill navbar as the Tags / Squad
// directory pages (SquadDirectoryNavbar), instead of the underlined TabContainer
// — so the look-and-feel matches the rest of the v2 directory headers. The
// date-range filter stays as a compact icon dropdown for the applicable sorts.
export function FeedExploreTabs(): ReactElement {
  const router = useRouter();
  const currentPath = (router.asPath || router.pathname).split('?')[0];
  const activeTab = urlToTab[currentPath] ?? ExploreTabs.Popular;
  const [period, setPeriod] = useQueryState({
    key: [QueryStateKeys.FeedPeriod],
    defaultValue: 0,
  });

  return (
    <div className="flex w-full min-w-0 items-center gap-2">
      <SquadDirectoryNavbar
        aria-label="Explore sort"
        className="!mx-0 min-w-0 flex-1 !border-0 !px-0"
      >
        {Object.entries(urlToTab).map(([url, label]) => (
          <SquadDirectoryNavbarItem
            key={label}
            buttonSize={ButtonSize.Small}
            isActive={currentPath === url}
            label={label}
            path={url}
            ariaLabel={`Show ${label}`}
          />
        ))}
      </SquadDirectoryNavbar>
      {sortsWithPeriod.includes(activeTab) && (
        <Dropdown
          iconOnly
          shouldIndicateSelected
          icon={<CalendarIcon size={IconSize.Small} />}
          buttonSize={ButtonSize.Small}
          buttonVariant={ButtonVariant.Float}
          className={{ button: '!size-8 !rounded-10 !p-0' }}
          selectedIndex={period}
          options={periodTexts}
          onChange={(_, index) => setPeriod(index)}
          buttonAriaLabel="Filter by date range"
        />
      )}
    </div>
  );
}
