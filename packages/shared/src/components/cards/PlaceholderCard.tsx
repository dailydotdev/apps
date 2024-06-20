import React, { forwardRef, HTMLAttributes, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import { CardSpace, CardTextContainer } from './Card';
import { ElementPlaceholder } from '../ElementPlaceholder';
import classed from '../../lib/classed';

const Text = classed(ElementPlaceholder, 'h-3 rounded-12 my-2');

export type PlaceholderCardProps = HTMLAttributes<HTMLDivElement>;

export const PlaceholderCard = forwardRef(function PlaceholderCard(
  { className, ...props }: PlaceholderCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  return (
    <article
      aria-busy
      className={classNames(
        className,
        'flex min-h-card flex-col rounded-16 bg-background-subtle p-2',
      )}
      {...props}
      ref={ref}
    >
      <CardTextContainer>
        <ElementPlaceholder className="my-2 size-6 rounded-full" />
        <Text style={{ width: '100%' }} />
        <Text style={{ width: '100%' }} />
        <Text style={{ width: '80%' }} />
      </CardTextContainer>
      <CardSpace className="my-2" />
      <ElementPlaceholder className="my-2 h-40 rounded-12" />
      <CardTextContainer>
        <Text style={{ width: '32%' }} />
      </CardTextContainer>
    </article>
  );
});
