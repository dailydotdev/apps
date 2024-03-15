import React, { HTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import { FlexRow } from '../utilities';
import { Squad } from '../../graphql/sources';

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

function SquadLoading({
  squad,
  sidebarRendered,
}: {
  squad: Pick<Squad, 'image' | 'description' | 'name' | 'public'>;
  sidebarRendered: boolean;
}): ReactElement {
  return (
    <ColumnContainer className="relative max-h-page w-full overflow-hidden px-16 pt-7">
      <div
        className={classNames(
          'squad-background-fade absolute top-0 z-0 h-full w-full',
          sidebarRendered && '-left-full translate-x-[60%]',
        )}
      />
      <FlexRow className="z-1 w-full">
        <ColumnContainer className="w-full laptop:w-auto">
          <PlaceholderElement className="h-16 w-16 rounded-full tablet:h-24 tablet:w-24" />
          {squad?.description && (
            <>
              <TitleDescription />
              <TitleDescription className="mt-4 flex laptop:hidden" />
            </>
          )}
        </ColumnContainer>
        <Actions className="ml-auto hidden laptop:flex" />
      </FlexRow>
      <RectangleElement className="mt-8 h-16 w-full max-w-[30.25rem] laptop:mt-6" />
      <Actions className="mt-8 flex laptop:hidden" />
      <RectangleElement className="my-6 h-10 w-52 self-end" />
      <div className="mx-auto w-full">
        <div className="grid grid-cols-3 gap-8">
          <RectangleElement className="h-96 w-full" />
          <RectangleElement className="h-96 w-full" />
          <RectangleElement className="h-96 w-full" />
        </div>
      </div>
    </ColumnContainer>
  );
}

export default SquadLoading;
