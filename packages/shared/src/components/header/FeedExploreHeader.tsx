import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { BreadCrumbs } from './BreadCrumbs';
import { CalendarIcon, HotIcon } from '../icons';
import { IconSize } from '../Icon';
import TabList from '../tabs/TabList';
import { Tab, TabContainer } from '../tabs/TabContainer';
import { checkIsExtension } from '../../lib/func';
import { getFeedName } from '../../lib/feed';
import { Dropdown } from '../fields/Dropdown';
import { QueryStateKeys, useQueryState } from '../../hooks/utils/useQueryState';
import { periodTexts } from '../layout/common';
import { OtherFeedPage } from '../../lib/query';

export enum ExploreTabs {
  Popular = 'Popular',
  MostUpvoted = 'By upvotes',
  BestDiscussions = 'By comments',
  ByDate = 'By date',
}

export const tabsToFeedMap: Partial<Record<OtherFeedPage, ExploreTabs>> = {
  [OtherFeedPage.Explore]: ExploreTabs.Popular,
  [OtherFeedPage.ExploreUpvoted]: ExploreTabs.MostUpvoted,
  [OtherFeedPage.ExploreDiscussed]: ExploreTabs.BestDiscussions,
  [OtherFeedPage.ExploreLatest]: ExploreTabs.ByDate,
};

export const urlToTab: Record<string, ExploreTabs> = {
  [`/${OtherFeedPage.Explore}`]: ExploreTabs.Popular,
  [`/${OtherFeedPage.Explore}/upvoted`]: ExploreTabs.MostUpvoted,
  [`/${OtherFeedPage.Explore}/discussed`]: ExploreTabs.BestDiscussions,
  [`/${OtherFeedPage.Explore}/latest`]: ExploreTabs.ByDate,
};

export const tabToUrl = Object.entries(urlToTab).reduce(
  (result, [url, tab]) => ({ ...result, [tab]: url }),
  {},
) as Record<ExploreTabs, string>;

interface FeedExploreHeaderProps {
  tab: ExploreTabs;
  setTab: (tab: ExploreTabs) => void;
  className?: {
    container?: string;
    tabWrapper?: string;
    tabBarHeader?: string;
    tabBarContainer?: string;
  };
  showBreadcrumbs?: boolean;
  showDropdown?: boolean;
}

const withDateRange = [
  OtherFeedPage.ExploreUpvoted,
  OtherFeedPage.ExploreDiscussed,
];

export function FeedExploreHeader({
  tab,
  setTab,
  className,
  showBreadcrumbs = true,
  showDropdown = true,
}: FeedExploreHeaderProps): ReactElement {
  const isExtension = checkIsExtension();
  const router = useRouter();
  const path = getFeedName(router.pathname);
  const [period, setPeriod] = useQueryState({
    key: [QueryStateKeys.FeedPeriod],
    defaultValue: 0,
  });

  return (
    <div className={classNames('flex w-full flex-col', className.container)}>
      {showBreadcrumbs && (
        <BreadCrumbs className="px-2">
          <HotIcon size={IconSize.XSmall} secondary /> Explore
        </BreadCrumbs>
      )}
      <div
        className={classNames(
          'flex flex-row items-center',
          className.tabWrapper,
        )}
      >
        {isExtension ? (
          <TabList<ExploreTabs>
            items={Object.values(ExploreTabs)}
            active={tab}
            onClick={setTab}
          />
        ) : (
          <TabContainer
            controlledActive={tabsToFeedMap[path]}
            className={{
              header: classNames('border-b-0', className.tabBarHeader),
              container: className.tabBarContainer,
            }}
            shouldMountInactive
          >
            {Object.entries(urlToTab).map(([url, label]) => (
              <Tab key={label} label={label} url={url} />
            ))}
          </TabContainer>
        )}
        {showDropdown && (
          <span className="ml-auto">
            {withDateRange.includes(path as OtherFeedPage) && (
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
        )}
      </div>
    </div>
  );
}
