import React, { ReactElement } from 'react';
import classed from '@dailydotdev/shared/src/lib/classed';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { SearchHistoryContainer } from './common';

const Pill = classed(ElementPlaceholder, 'h-8 rounded-12');
const ShortPill = classed(Pill, 'w-1/2');
const LongPill = classed(Pill, 'w-4/5');

export function SearchSkeleton(): ReactElement {
  return (
    <SearchHistoryContainer aria-busy="true">
      <LongPill />
      <ShortPill />
      <LongPill />
      <ShortPill />
      <LongPill />
      <ShortPill />
    </SearchHistoryContainer>
  );
}
