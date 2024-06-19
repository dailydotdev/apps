import React, { ReactElement, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Dropdown } from '../fields/Dropdown';
import { ExploreTabs, tabToUrl, urlToTab } from './FeedExploreHeader';
import { CalendarIcon } from '../icons';
import { IconSize } from '../Icon';
import { periodTexts } from '../layout/common';
import { QueryStateKeys, useQueryState } from '../../hooks/utils/useQueryState';

const withDateRange = [ExploreTabs.MostUpvoted, ExploreTabs.BestDiscussions];

const mobileList = [
  { value: ExploreTabs.Popular, text: ExploreTabs.Popular },
  { value: ExploreTabs.MostUpvoted, text: ExploreTabs.MostUpvoted },
  { value: ExploreTabs.BestDiscussions, text: ExploreTabs.BestDiscussions },
  { value: ExploreTabs.ByDate, text: ExploreTabs.ByDate },
];

const listNames = mobileList.map((list) => list.text);

export function FeedExploreDropdown(): ReactElement {
  const [selected, setSelected] = React.useState(-1);
  const tab = mobileList[selected];
  const router = useRouter();
  const [period, setPeriod] = useQueryState({
    key: [QueryStateKeys.FeedPeriod],
    defaultValue: 0,
  });

  const onChange = (value: string, index: number) => {
    setSelected(index);

    const url = tabToUrl[value as ExploreTabs];

    if (url) {
      router.push(url);
    }
  };

  useEffect(() => {
    if (selected > -1) {
      return;
    }

    const item = urlToTab[router.pathname];
    const index = mobileList.findIndex((list) => list.text === item);
    setSelected(index);
  }, [router.pathname, selected]);

  return (
    <span className="flex flex-row items-center justify-between px-4 tablet:mt-6">
      <Dropdown
        className={{ container: '!w-56' }}
        selectedIndex={selected}
        options={listNames}
        onChange={onChange}
      />
      {tab && withDateRange.includes(tab.value) && (
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
  );
}
