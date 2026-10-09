import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import {
  ListCard,
  CardSpace,
  CardTextContainer,
} from '../common/list/ListCard';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import { TextPlaceholder, TitleTextPlaceholder } from '../../widgets/common';
import type { PlaceholderProps } from './common/common';

export const PlaceholderList = forwardRef(function PlaceholderCard(
  { className, ...props }: PlaceholderProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  return (
    <ListCard aria-busy className={classNames(className)} {...props} ref={ref}>
      <CardTextContainer>
        <CardSpace className="mb-2 flex flex-row">
          <ElementPlaceholder className="size-10 rounded-12" />
          <CardSpace className="ml-4 grid content-center gap-1">
            <TextPlaceholder className="w-20" />
            <TextPlaceholder className="w-40" />
          </CardSpace>
        </CardSpace>
      </CardTextContainer>
      <CardSpace>
        <CardSpace className="flex flex-col mobileXL:flex-row">
          <CardSpace className="mr-4 flex flex-1 flex-col">
            <TitleTextPlaceholder className="mt-4 w-3/4" />
            <TitleTextPlaceholder className="mt-2 w-1/2" />
            <CardSpace className="flex" />
          </CardSpace>
          <ElementPlaceholder className="mt-4 hidden h-auto max-h-[12.5rem] min-h-[10rem] w-full rounded-16 mobileXL:max-h-40 mobileXL:w-40 mobileXXL:max-h-56 mobileXXL:w-56 laptop:block" />
        </CardSpace>
        <ElementPlaceholder className="mt-4 h-10 w-56 rounded-12" />
      </CardSpace>
    </ListCard>
  );
});
