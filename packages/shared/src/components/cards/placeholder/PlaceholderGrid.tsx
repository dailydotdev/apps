import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { CardSpace, CardTextContainer } from '../common/Card';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import { TextPlaceholder, TitleTextPlaceholder } from '../../widgets/common';
import type { PlaceholderProps } from './common/common';

export const PlaceholderGrid = forwardRef(function PlaceholderCard(
  { className, ...props }: PlaceholderProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  return (
    <article
      aria-busy
      className={classNames(
        className,
        'flex flex-col rounded-16 p-2',
        'min-h-card',
      )}
      {...props}
      ref={ref}
    >
      <CardTextContainer>
        <ElementPlaceholder className="my-2 size-6 rounded-12" />
        <TitleTextPlaceholder className="my-1 w-full" />
        <TitleTextPlaceholder className="my-1 w-full" />
        <TitleTextPlaceholder className="my-1 w-4/5" />
      </CardTextContainer>
      <CardSpace className="my-2" />
      <ElementPlaceholder className="my-2 h-40 rounded-12" />
      <CardTextContainer className="py-1.5">
        <TextPlaceholder className="w-1/3" />
      </CardTextContainer>
    </article>
  );
});
