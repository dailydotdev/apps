import type { ReactElement } from 'react';
import React from 'react';
import {
  TypographyType,
  Typography,
} from '../../../components/typography/Typography';
import TabList from '../../../components/tabs/TabList';
import { TAB_ITEMS } from './Activity.helpers';

export const ActivityHeader = ({
  selectedTab,
  onTabClick,
}: {
  selectedTab: string;
  onTabClick: (label: string) => void;
}): ReactElement => {
  return (
    <div className="flex flex-col gap-3">
      <Typography type={TypographyType.Body} bold>
        Activity
      </Typography>
      <TabList
        items={TAB_ITEMS}
        active={selectedTab}
        onClick={onTabClick}
        className={{ item: '!p-0 !pr-3', indicator: 'hidden' }}
      />
    </div>
  );
};

