import React, { ReactElement } from 'react';
import { SearchHistoryContainer } from './common';
import classed from '../../lib/classed';
import { Pill } from '../utilities/loaders';
import { WithClassNameProps } from '../utilities';

const ShortPill = classed(Pill, 'w-1/2');
const LongPill = classed(Pill, 'w-4/5');

export function SearchSkeleton({
  className,
}: WithClassNameProps): ReactElement {
  return (
    <SearchHistoryContainer aria-busy="true" className={className}>
      <LongPill />
      <ShortPill />
      <LongPill />
      <ShortPill />
      <LongPill />
      <ShortPill />
    </SearchHistoryContainer>
  );
}
