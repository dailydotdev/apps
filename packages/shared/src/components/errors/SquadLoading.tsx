import React, { HTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import { FlexRow } from '../utilities';

const PlaceholderElement = classed('div', 'bg-accent-pepper-subtlest');
const RectangleElement = classed(PlaceholderElement, 'rounded-12');
const Container = classed('div', 'flex flex-row');
const ColumnContainer = classed(
  Container,
  'flex-col items-center laptop:items-start',
);

const TitleDescription = ({ className }: HTMLAttributes<HTMLDivElement>) => (
  <ColumnContainer className={classNames('ml-4 flex-1 laptop:ml-0', className)}>
    <RectangleElement className="mt-6 h-5 w-[16rem] tablet:w-[30rem]" />
    <RectangleElement className="mt-4 h-5 w-1/2 tablet:w-52" />
  </ColumnContainer>
);

const Actions = ({ className }: HTMLAttributes<HTMLDivElement>) => (
  <FlexRow className={classNames('gap-3', className)}>
    <RectangleElement className="h-10 w-40" />
    <RectangleElement className="h-10 w-10 laptop:w-40" />
    <RectangleElement className="h-10 w-10" />
  </FlexRow>
);

function SquadLoading(): ReactElement {
  return (
    <ColumnContainer className="max-h-page w-full overflow-hidden px-16 pt-7">
      <FlexRow className="w-full">
        <ColumnContainer className="w-full laptop:w-auto">
          <PlaceholderElement className="h-14 w-14 rounded-full tablet:h-24 tablet:w-24" />
          <TitleDescription />
          <TitleDescription className="mt-4 flex laptop:hidden" />
        </ColumnContainer>
        <Actions className="ml-auto hidden laptop:flex" />
      </FlexRow>
      <RectangleElement className="mt-8 h-16 w-full max-w-[10rem] laptop:mt-14 laptop:max-w-[38.5rem]" />
      <Actions className="mt-8 flex laptop:hidden" />
      <RectangleElement className="mt-8 h-96 w-full tablet:w-64 laptop:mt-16" />
    </ColumnContainer>
  );
}

export default SquadLoading;
