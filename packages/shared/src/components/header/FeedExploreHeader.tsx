import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { BreadCrumbs } from './BreadCrumbs';
import { CalendarIcon, HotIcon } from '../icons';
import { IconSize } from '../Icon';
import TabList from '../tabs/TabList';
import { Tab, TabContainer } from '../tabs/TabContainer';
import { checkIsExtension } from '../../lib/func';
import { SharedFeedPage } from '../utilities';
import { getFeedName } from '../../lib/feed';
import { Dropdown } from '../fields/Dropdown';
import { QueryStateKeys, useQueryState } from '../../hooks/utils/useQueryState';
import { periodTexts } from '../layout/common';

export enum ExploreTabs {
  Popular = 'Popular',
  MostUpvoted = 'By upvotes',
  BestDiscussions = 'By comments',
  ByDate = 'By date',
}

const tabsToFeedMap: Partial<Record<SharedFeedPage, ExploreTabs>> = {
  [SharedFeedPage.Explore]: ExploreTabs.Popular,
  [SharedFeedPage.ExploreUpvoted]: ExploreTabs.MostUpvoted,
  [SharedFeedPage.ExploreDiscussed]: ExploreTabs.BestDiscussions,
  [SharedFeedPage.ExploreLatest]: ExploreTabs.ByDate,
};

export const urlToTab: Record<string, ExploreTabs> = {
  '/explore': ExploreTabs.Popular,
  '/explore/upvoted': ExploreTabs.MostUpvoted,
  '/explore/discussed': ExploreTabs.BestDiscussions,
  '/explore/latest': ExploreTabs.ByDate,
};

export const tabToUrl = Object.entries(urlToTab).reduce(
  (result, [url, tab]) => ({ ...result, [tab]: url }),
  {},
) as Record<ExploreTabs, string>;

interface FeedExploreHeaderProps {
  tab: ExploreTabs;
  setTab: (tab: ExploreTabs) => void;
}

const withDateRange = [
  SharedFeedPage.ExploreUpvoted,
  SharedFeedPage.ExploreDiscussed,
];

export function FeedExploreHeader({
  tab,
  setTab,
}: FeedExploreHeaderProps): ReactElement {
  const isExtension = checkIsExtension();
  const router = useRouter();
  const path = getFeedName(router.pathname);
  const [period, setPeriod] = useQueryState({
    key: [QueryStateKeys.FeedPeriod],
    defaultValue: 0,
  });

  return (
    <div className="flex w-full flex-col">
      <BreadCrumbs className="px-2">
        <HotIcon size={IconSize.XSmall} secondary /> Explore
      </BreadCrumbs>
      <div className="my-4 flex flex-row items-center">
        {isExtension ? (
          <TabList<ExploreTabs>
            items={Object.values(ExploreTabs)}
            active={tab}
            onClick={setTab}
          />
        ) : (
          <TabContainer
            controlledActive={tabsToFeedMap[path]}
            className={{ header: 'border-b-0' }}
            shouldMountInactive
          >
            {Object.entries(urlToTab).map(([url, label]) => (
              <Tab key={label} label={label} url={url} />
            ))}
          </TabContainer>
        )}
        <span className="ml-auto">
          {withDateRange.includes(path as SharedFeedPage) && (
            <Dropdown
              iconOnly
              dynamicMenuWidth
              shouldIndicateSelected
              icon={<CalendarIcon size={IconSize.Medium} />}
              selectedIndex={period}
              options={periodTexts}
              onChange={(_, index) => setPeriod(index)}
            />
          )}
        </span>
      </div>
    </div>
  );
}
