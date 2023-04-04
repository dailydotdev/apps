import React, { ReactElement } from 'react';
import classed from '../../lib/classed';
import { FlexRow } from '../utilities';

const PlaceholderElement = classed('div', 'bg-theme-bg-tertiary');
const RectangleElement = classed(PlaceholderElement, 'rounded-12');
const Container = classed('div', 'flex flex-row');
const ColumnContainer = classed(
  Container,
  'flex-col items-center laptop:items-start',
);

function SquadLoading(): ReactElement {
  return (
    <ColumnContainer className="overflow-hidden px-16 pt-7 w-full max-h-page">
      <FlexRow className="w-full">
        <ColumnContainer>
          <PlaceholderElement className="w-14 tablet:w-24 h-14 tablet:h-24 rounded-full" />
          <ColumnContainer className="flex-1 ml-4 tablet:ml-0">
            <RectangleElement className="tablet:mt-6 w-full h-5 tablet:w-[30rem]" />
            <RectangleElement className="mt-4 w-1/2 tablet:w-52 h-5" />
          </ColumnContainer>
        </ColumnContainer>
        <FlexRow className="gap-3 ml-auto">
          <RectangleElement className="hidden tablet:flex w-40 h-10" />
          <RectangleElement className="w-20 tablet:w-40 h-10" />
          <RectangleElement className="w-10 h-10" />
        </FlexRow>
      </FlexRow>
      <RectangleElement className="mt-14 w-full h-16 max-w-[38.5rem]" />
      <RectangleElement className="mt-16 w-full tablet:w-64 h-96" />
    </ColumnContainer>
  );
}

export default SquadLoading;
