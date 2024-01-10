import React, { forwardRef, HTMLAttributes, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import { Card, CardSpace, CardTextContainer } from './Card';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import classed from '../../../lib/classed';

const Text = classed(ElementPlaceholder, 'rounded-12');

export type PlaceholderCardProps = {
  showImage?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export const PlaceholderCard = forwardRef(function PlaceholderCard(
  { className, showImage, ...props }: PlaceholderCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  return (
    <Card aria-busy className={classNames(className)} {...props} ref={ref}>
      <CardTextContainer>
        <CardSpace className="mb-2 flex flex-row">
          <ElementPlaceholder className="size-10 rounded-full" />
          <CardSpace className="ml-4 grid content-center gap-2">
            <Text className="h-2 w-20" />
            <Text className="h-2 w-40" />
          </CardSpace>
        </CardSpace>
      </CardTextContainer>
      <CardSpace className="my-4">
        <Text className="h-4 w-3/4" />
        <Text className="mt-2 h-4 w-1/2" />
      </CardSpace>
      <ElementPlaceholder className="h-50 rounded-16" />
    </Card>
  );
});
