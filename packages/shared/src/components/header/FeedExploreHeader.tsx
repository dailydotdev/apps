import React, { ReactElement } from 'react';
import { BreadCrumbs } from './BreadCrumbs';
import { HotIcon } from '../icons';
import { IconSize } from '../Icon';
import TabList from '../tabs/TabList';

export enum ExploreTabs {
  Popular = 'Popular',
  ByDate = 'By date',
}

interface FeedExploreHeaderProps {
  tab: ExploreTabs;
  setTab: (tab: ExploreTabs) => void;
}

export function FeedExploreHeader({
  tab,
  setTab,
}: FeedExploreHeaderProps): ReactElement {
  return (
    <div className="flex flex-col">
      <BreadCrumbs className="px-2">
        <HotIcon size={IconSize.XSmall} secondary /> Explore
      </BreadCrumbs>
      <div className="my-4 flex flex-row items-center">
        <TabList<ExploreTabs>
          items={Object.values(ExploreTabs)}
          active={tab}
          onClick={setTab}
        />
      </div>
    </div>
  );
}
