import React, { ReactElement } from 'react';
import { SearchHistoryContainer } from './common';
import { AiIcon } from '../icons';
import { IconSize } from '../Icon';

export function SearchEmpty(): ReactElement {
  return (
    <SearchHistoryContainer className="items-center pt-24">
      <AiIcon className="text-text-tertiary" size={IconSize.XXXLarge} />
      <h1 className="text-center typo-title1">Your search history is empty.</h1>
      <p className="text-center text-text-secondary typo-body">
        Go back to your feed, begin exploring with your queries. Each search
        query will be listed here.
      </p>
    </SearchHistoryContainer>
  );
}
