import React, { HTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import { FlexRow } from '../utilities';

const PlaceholderElement = classed('div', 'bg-theme-bg-tertiary');
const RectangleElement = classed(PlaceholderElement, 'rounded-12');
const Container = classed('div', 'flex flex-row');
const ColumnContainer = classed(
  Container,
  'flex-col items-center laptop:items-start',
);

const TitleDescription = ({ className }: HTMLAttributes<HTMLDivElement>) => (
  <ColumnContainer className={classNames('flex-1 ml-4 laptop:ml-0', className)}>
    <RectangleElement className="mt-6 h-5 w-[16rem] tablet:w-[30rem]" />
    <RectangleElement className="mt-4 w-1/2 tablet:w-52 h-5" />
  </ColumnContainer>
);

const Actions = ({ className }: HTMLAttributes<HTMLDivElement>) => (
  <FlexRow className={classNames('gap-3', className)}>
    <RectangleElement className="w-40 h-10" />
    <RectangleElement className="w-10 laptop:w-40 h-10" />
    <RectangleElement className="w-10 h-10" />
  </FlexRow>
);

function SquadLoading(): ReactElement {
  return (
    <ColumnContainer className="overflow-hidden px-16 pt-7 w-full max-h-page">
      <FlexRow className="w-full">
        <ColumnContainer className="w-full laptop:w-auto">
          <PlaceholderElement className="w-14 tablet:w-24 h-14 tablet:h-24 rounded-full" />
          <TitleDescription />
          <TitleDescription className="flex laptop:hidden mt-4" />
        </ColumnContainer>
        <Actions className="hidden laptop:flex ml-auto" />
      </FlexRow>
      <RectangleElement className="mt-8 laptop:mt-14 w-full h-16 max-w-[10rem] laptop:max-w-[38.5rem]" />
      <Actions className="flex laptop:hidden mt-8" />
      <RectangleElement className="mt-8 laptop:mt-16 w-full tablet:w-64 h-96" />
    </ColumnContainer>
  );
}

export default SquadLoading;
