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
import { checkIsExtension } from '../../lib/func';

const sortsWithPeriod: ExploreTabs[] = [
  ExploreTabs.MostUpvoted,
  ExploreTabs.BestDiscussions,
];

interface FeedExploreTabsProps {
  // Extension only. There the new tab never changes route — the sort switches
  // the feed in place — so the active sort and the switcher come from
  // MainFeedLayout, exactly as v1 drives FeedExploreHeader's TabList. On the
  // webapp each sort is its own route and these go unused.
  tab?: ExploreTabs;
  setTab?: (tab: ExploreTabs) => void;
}

// Explore sort tabs rendered with the same pill navbar as the Tags / Squad
// directory pages (SquadDirectoryNavbar), instead of the underlined TabContainer
// — so the look-and-feel matches the rest of the v2 directory headers. The
// date-range filter stays as a compact icon dropdown for the applicable sorts.
export function FeedExploreTabs({
  tab,
  setTab,
}: FeedExploreTabsProps): ReactElement {
  const router = useRouter();
  const isExtension = checkIsExtension();
  const currentPath = (router.asPath || router.pathname).split('?')[0];
  const activeTab =
    (isExtension ? tab : urlToTab[currentPath]) ?? ExploreTabs.Popular;
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
            isActive={isExtension ? activeTab === label : currentPath === url}
            label={label}
            // These paths are root-relative so they can match `asPath`, which
            // on the extension resolves against chrome-extension://<id> and
            // 404s. So there they render as buttons that switch the feed in
            // place instead — the contract v1's TabList has, and the one the
            // sidebar rows rely on (docs/sidebar-links-extension-audit.md).
            path={isExtension ? undefined : url}
            onClick={isExtension ? () => setTab?.(label) : undefined}
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
