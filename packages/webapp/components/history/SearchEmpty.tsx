import React, { ReactElement } from 'react';
import { AiIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { SearchHistoryContainer } from './common';

export function SearchEmpty(): ReactElement {
  return (
    <SearchHistoryContainer className="items-center pt-24">
      <AiIcon className="text-theme-label-tertiary" size={IconSize.XXXLarge} />
      <h1 className="text-center typo-title1">Your search history is empty.</h1>
      <p className="text-center typo-body text-theme-label-secondary">
        Go back to your feed, begin exploring with your queries. Each search
        query will be listed here.
      </p>
    </SearchHistoryContainer>
  );
}
