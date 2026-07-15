import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { Dropdown } from '../fields/Dropdown';
import { CalendarIcon } from '../icons';
import { IconSize } from '../Icon';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import { ExploreTabs, tabToUrl, urlToTab } from './FeedExploreHeader';
import { QueryStateKeys, useQueryState } from '../../hooks/utils/useQueryState';
import { periodTexts } from '../layout/common';

const sortLabels = Object.values(ExploreTabs);
const sortsWithPeriod: ExploreTabs[] = [
  ExploreTabs.MostUpvoted,
  ExploreTabs.BestDiscussions,
];

// v2 Explore: switch the feed's ranking via a "Sort" dropdown rather than a
// second row of tabs — sorting a feed isn't navigating to a sibling page, so
// a dropdown reads cleaner (Reddit/GitHub pattern). Each sort is still its
// own route, so selecting one navigates.
export function ExploreSortDropdown(): ReactElement {
  const router = useRouter();
  const currentPath = (router.asPath || router.pathname).split('?')[0];
  const activeTab = urlToTab[currentPath] ?? ExploreTabs.Popular;
  const selectedIndex = Math.max(0, sortLabels.indexOf(activeTab));
  const [period, setPeriod] = useQueryState({
    key: [QueryStateKeys.FeedPeriod],
    defaultValue: 0,
  });

  return (
    <span className="ml-auto flex items-center gap-2">
      {sortsWithPeriod.includes(activeTab) && (
        <Dropdown
          iconOnly
          shouldIndicateSelected
          icon={<CalendarIcon size={IconSize.Small} />}
          buttonSize={ButtonSize.Small}
          buttonVariant={ButtonVariant.Float}
          // Render the date filter as a true icon-only square button (the
          // shared Dropdown otherwise lays its trigger out as a full-width
          // value field). Matches the design system's icon-only Small spec
          // (`IconOnlySizeToClassName`) and the v2 layout's compact icon
          // buttons: 32px square, rounded-10, no padding.
          className={{ button: '!size-8 !rounded-10 !p-0' }}
          selectedIndex={period}
          options={periodTexts}
          onChange={(_, index) => setPeriod(index)}
          buttonAriaLabel="Filter by date range"
        />
      )}
      <Dropdown
        selectedIndex={selectedIndex}
        options={sortLabels}
        buttonSize={ButtonSize.Small}
        buttonVariant={ButtonVariant.Float}
        buttonAriaLabel="Sort posts"
        onChange={(value) => {
          const url = tabToUrl[value as ExploreTabs];
          if (url) {
            router.push(url).catch(() => undefined);
          }
        }}
      />
    </span>
  );
}
