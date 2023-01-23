import React, { ReactElement } from 'react';
import classed from '../../lib/classed';

const PlaceholderElement = classed('div', 'bg-theme-float');
const RectangleElement = classed(PlaceholderElement, 'rounded-12');
const Container = classed('div', 'flex tablet:items-center');
const ColumnContainer = classed(Container, 'flex-col');

function SquadLoading(): ReactElement {
  return (
    <ColumnContainer className="overflow-hidden p-4 pt-6 w-full max-h-page">
      <Container className="tablet:flex-col">
        <PlaceholderElement className="w-14 tablet:w-24 h-14 tablet:h-24 rounded-full" />
        <ColumnContainer className="flex-1 ml-4 tablet:ml-0">
          <RectangleElement className="tablet:mt-6 w-full h-5 tablet:w-[30rem]" />
          <RectangleElement className="mt-4 w-1/2 tablet:w-52 h-5" />
        </ColumnContainer>
      </Container>
      <ColumnContainer className="tablet:hidden gap-3 mt-6 w-full">
        <RectangleElement className="w-5/6 h-3" />
        <RectangleElement className="w-1/2 h-3" />
        <RectangleElement className="w-2/3 h-3" />
      </ColumnContainer>
      <div className="flex flex-row gap-3 mt-14 tablet:mt-20">
        <RectangleElement className="hidden tablet:flex w-40 h-10" />
        <RectangleElement className="w-20 tablet:w-40 h-10" />
        <RectangleElement className="w-10 h-10" />
      </div>
      <RectangleElement className="tablet:hidden mt-4 w-full h-10" />
      <div className="mt-10 tablet:mt-28 tablet:ml-20 w-full">
        <RectangleElement className="w-full tablet:w-64 h-96" />
      </div>
    </ColumnContainer>
  );
}

export default SquadLoading;
