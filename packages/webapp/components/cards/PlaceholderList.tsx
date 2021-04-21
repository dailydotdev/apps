import React, { ReactElement } from 'react';
import { ListCardMain } from './Card';
import { ElementPlaceholder } from '../utilities';
import classed from '../../lib/classed';
import classNames from 'classnames';
import { PlaceholderCardProps } from './PlaceholderCard';

const Text = classed(ElementPlaceholder, 'h-3 rounded-xl');

export function PlaceholderList({
  className,
  ...props
}: PlaceholderCardProps): ReactElement {
  return (
    <article
      aria-busy
      className={classNames(
        className,
        'flex items-start rounded-2xl bg-theme-post-disabled py-4 pl-4 pr-10',
      )}
      {...props}
    >
      <ElementPlaceholder className="w-6 h-6 rounded-full mr-4" />
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
}
