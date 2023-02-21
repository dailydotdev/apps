import React, { ReactElement } from 'react';
import classed from '../../lib/classed';

const PlaceholderElement = classed('div', 'bg-theme-float');
const RectangleElement = classed(PlaceholderElement, 'rounded-12');
const Container = classed('div', 'flex tablet:items-center');
const ColumnContainer = classed(Container, 'flex-col');

function SquadLoading(): ReactElement {
  return (
    <ColumnContainer className="max-h-page w-full overflow-hidden p-4 pt-6">
      <Container className="tablet:flex-col">
        <PlaceholderElement className="h-14 w-14 rounded-full tablet:h-24 tablet:w-24" />
        <ColumnContainer className="ml-4 flex-1 tablet:ml-0">
          <RectangleElement className="h-5 w-full tablet:mt-6 tablet:w-[30rem]" />
          <RectangleElement className="mt-4 h-5 w-1/2 tablet:w-52" />
        </ColumnContainer>
      </Container>
      <ColumnContainer className="mt-6 w-full gap-3 tablet:hidden">
        <RectangleElement className="h-3 w-5/6" />
        <RectangleElement className="h-3 w-1/2" />
        <RectangleElement className="h-3 w-2/3" />
      </ColumnContainer>
      <div className="mt-14 flex flex-row gap-3 tablet:mt-20">
        <RectangleElement className="hidden h-10 w-40 tablet:flex" />
        <RectangleElement className="h-10 w-20 tablet:w-40" />
        <RectangleElement className="h-10 w-10" />
      </div>
      <RectangleElement className="mt-4 h-10 w-full tablet:hidden" />
      <div className="mt-10 w-full tablet:mt-28 tablet:ml-20">
        <RectangleElement className="h-96 w-full tablet:w-64" />
      </div>
    </ColumnContainer>
  );
}

export default SquadLoading;
