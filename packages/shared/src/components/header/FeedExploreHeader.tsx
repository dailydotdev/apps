import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { BreadCrumbs } from './BreadCrumbs';
import { HotIcon } from '../icons';
import { IconSize } from '../Icon';
import TabList from '../tabs/TabList';
import { Tab, TabContainer } from '../tabs/TabContainer';
import { checkIsExtension } from '../../lib/func';
import { SharedFeedPage } from '../utilities';
import { getFeedName } from '../../lib/feed';

export enum ExploreTabs {
  Popular = 'Popular',
  MostUpvoted = 'Most upvoted',
  BestDiscussions = 'Best discussions',
  ByDate = 'By date',
}

const tabsToFeedMap: Partial<Record<SharedFeedPage, ExploreTabs>> = {
  [SharedFeedPage.Explore]: ExploreTabs.Popular,
  [SharedFeedPage.ExploreUpvoted]: ExploreTabs.MostUpvoted,
  [SharedFeedPage.ExploreDiscussed]: ExploreTabs.BestDiscussions,
  [SharedFeedPage.ExploreLatest]: ExploreTabs.ByDate,
};

const urlToTab: Record<string, ExploreTabs> = {
  '/explore': ExploreTabs.Popular,
  '/explore/upvoted': ExploreTabs.MostUpvoted,
  '/explore/discussed': ExploreTabs.BestDiscussions,
  '/explore/latest': ExploreTabs.ByDate,
};

interface FeedExploreHeaderProps {
  tab: ExploreTabs;
  setTab: (tab: ExploreTabs) => void;
}

export function FeedExploreHeader({
  tab,
  setTab,
}: FeedExploreHeaderProps): ReactElement {
  const isExtension = checkIsExtension();
  const router = useRouter();

  return (
    <div className="flex flex-col">
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
            controlledActive={tabsToFeedMap[getFeedName(router.pathname)]}
            className={{ header: 'border-b-0' }}
            shouldMountInactive
          >
            {Object.entries(urlToTab).map(([url, label]) => (
              <Tab key={label} label={label} url={url} />
            ))}
          </TabContainer>
        )}
      </div>
    </div>
  );
}
