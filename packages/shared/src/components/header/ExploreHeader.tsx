import React, { ReactElement } from 'react';
import { OtherFeedPage } from '../../lib/query';
import { QueryStateKeys, useQueryState } from '../../hooks/utils/useQueryState';
import { Dropdown } from '../fields/Dropdown';
import { CalendarIcon } from '../icons';
import { IconSize } from '../Icon';
import { ButtonSize } from '../buttons/common';
import { periodTexts } from '../layout/common';

const withDateRange = [
  OtherFeedPage.ExploreUpvoted,
  OtherFeedPage.ExploreDiscussed,
];

interface ExploreHeaderProps {
  path: string;
}

export function ExploreHeader({ path }: ExploreHeaderProps): ReactElement {
  const [period, setPeriod] = useQueryState({
    key: [QueryStateKeys.FeedPeriod],
    defaultValue: 0,
  });

  return (
    <h3 className="mx-4 flex h-12 items-center justify-between font-bold typo-body">
      Explore
      {withDateRange.includes(path as OtherFeedPage) && (
        <Dropdown
          iconOnly
          dynamicMenuWidth
          shouldIndicateSelected
          icon={<CalendarIcon size={IconSize.Medium} />}
          selectedIndex={period}
          options={periodTexts}
          buttonSize={ButtonSize.Medium}
          onChange={(_, index) => setPeriod(index)}
        />
      )}
    </h3>
  );
}
