import React, { forwardRef, HTMLAttributes, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import { ListCard, CardSpace, CardTextContainer } from './ListCard';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import classed from '../../../lib/classed';

const Text = classed(ElementPlaceholder, 'rounded-12');

export type PlaceholderCardProps = HTMLAttributes<HTMLDivElement>;

export const PlaceholderList = forwardRef(function PlaceholderCard(
  { className, ...props }: PlaceholderCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  return (
    <ListCard aria-busy className={classNames(className)} {...props} ref={ref}>
      <CardTextContainer>
        <CardSpace className="mb-2 flex flex-row">
          <ElementPlaceholder className="size-10 rounded-full" />
          <CardSpace className="ml-4 grid content-center gap-2">
            <Text className="h-2 w-20" />
            <Text className="h-2 w-40" />
          </CardSpace>
        </CardSpace>
      </CardTextContainer>
      <CardSpace>
        <CardSpace className="flex flex-col mobileXL:flex-row">
          <CardSpace className="mr-4 flex flex-1 flex-col">
            <Text className="mt-4 h-4 w-3/4" />
            <Text className="mt-2 h-4 w-1/2" />
            <CardSpace className="flex" />
          </CardSpace>
          <ElementPlaceholder className="mt-4 h-auto max-h-[12.5rem] min-h-[10rem] w-full rounded-16 mobileXL:max-h-40 mobileXL:w-40 mobileXXL:max-h-56 mobileXXL:w-56" />
        </CardSpace>
        <Text className="mt-4 h-10 w-56" />
      </CardSpace>
    </ListCard>
  );
});
