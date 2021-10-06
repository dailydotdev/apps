import React, { forwardRef, ReactElement, Ref } from 'react';
import classNames from 'classnames';
import { ListCardMain } from './Card';
import { ElementPlaceholder } from '../ElementPlaceholder';
import classed from '../../lib/classed';
import { PlaceholderCardProps } from './PlaceholderCard';

const Text = classed(ElementPlaceholder, 'h-3 rounded-xl');

export const PlaceholderList = forwardRef(function PlaceholderList(
  { className, ...props }: PlaceholderCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  return (
    <article
      aria-busy
      className={classNames(
        className,
        'flex items-start rounded-2xl bg-theme-post-disabled py-4 pl-4 pr-10',
      )}
      {...props}
      ref={ref}
    >
      <ElementPlaceholder className="mr-4 w-6 h-6 rounded-full" />
      <ListCardMain>
        <Text style={{ width: '100%' }} />
        <Text
          style={{
            width: '67%',
            marginTop: '0.75rem',
            marginBottom: '0.75rem',
          }}
        />
        <Text
          style={{
            width: '13%',
            marginTop: '0.75rem',
          }}
        />
      </ListCardMain>
    </article>
  );
});
