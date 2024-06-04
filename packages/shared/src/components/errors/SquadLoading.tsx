import React, { HTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import { FlexCol, FlexRow } from '../utilities';
import { Squad } from '../../graphql/sources';

const PlaceholderElement = classed('div', 'bg-accent-pepper-subtlest');
const RectangleElement = classed(PlaceholderElement, 'rounded-12');
const Container = classed('div', 'flex flex-row');
const ColumnContainer = classed(
  Container,
  'flex-col items-center laptopL:items-start',
);

const TitleDescription = ({ className }: HTMLAttributes<HTMLDivElement>) => (
  <ColumnContainer
    className={classNames('ml-4 flex-1 laptopL:ml-0', className)}
  >
    <RectangleElement className="mt-6 h-5 w-[16rem] tablet:w-[30rem]" />
    <RectangleElement className="my-4 h-5 w-1/2 tablet:w-52" />
  </ColumnContainer>
);

const Actions = ({ className }: HTMLAttributes<HTMLDivElement>) => (
  <FlexRow className={classNames('flex-col gap-3 laptopL:flex-row', className)}>
    <RectangleElement className="h-10 w-40" />
    <FlexRow className="justify-center gap-3">
      <RectangleElement className="h-10 w-10" />
      <RectangleElement className="h-10 w-10" />
    </FlexRow>
  </FlexRow>
);

function SquadLoading({
  squad,
  sidebarRendered,
}: {
  squad: Pick<Squad, 'image' | 'description' | 'name' | 'public'>;
  sidebarRendered: boolean;
}): ReactElement {
  return (
    <div className=" relative mb-4 flex max-w-full flex-1 flex-col items-start pb-16 pt-2 laptop:pt-8">
      <div
        className={classNames(
          'squad-background-fade absolute top-0 z-0 h-full w-full',
          sidebarRendered && '-left-full translate-x-[60%]',
        )}
      />
      <FlexCol className="relative min-h-20 w-full items-center border-border-subtlest-tertiary px-6 tablet:mb-6 tablet:border-b tablet:pb-20 laptopL:items-start laptopL:px-18 laptopL:pb-14">
        <PlaceholderElement className="h-16 w-16 rounded-full tablet:h-24 tablet:w-24" />
        {squad?.description && <TitleDescription />}
        <div className="mt-8 flex h-fit w-full flex-row justify-center gap-4 tablet:w-auto laptopL:absolute laptopL:right-18 laptopL:top-0 laptopL:mt-0">
          <Actions className="hidden laptop:flex laptopL:ml-auto" />
          <Actions className="mt-8 flex laptop:hidden" />
        </div>
        <FlexRow className="mt-6 gap-3">
          <RectangleElement className="h-12 w-32" />
          <RectangleElement className="h-12 w-12 tablet:w-32" />
          <RectangleElement className="hidden h-12 w-32 tablet:flex" />
        </FlexRow>
        <RectangleElement className="relative bottom-0 mt-8 flex h-16 w-full max-w-[30.25rem] flex-col  pt-8 tablet:absolute tablet:translate-y-1/2 tablet:flex-row tablet:p-0 laptop:mt-6 laptop:max-w-[38.25rem] laptopL:px-0" />
      </FlexCol>
      <ColumnContainer className="relative max-h-page w-full overflow-hidden px-16 pt-7">
        <RectangleElement className="my-6 h-10 w-52 self-end" />
        <div className="mx-auto w-full">
          <div className="grid grid-cols-1 gap-8 tablet:grid-cols-2 laptopL:grid-cols-3">
            <RectangleElement className="h-96 w-full" />
            <RectangleElement className="h-96 w-full" />
            <RectangleElement className="h-96 w-full" />
          </div>
        </div>
      </ColumnContainer>
    </div>
  );
}

export default SquadLoading;
