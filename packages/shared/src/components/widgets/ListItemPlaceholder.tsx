import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { TextPlaceholder } from './common';

interface ListItemPlaceholderProps {
  padding?: string;
  textClassName?: string;
}

export const ListItemPlaceholder = ({
  padding = 'py-3 px-4',
  textClassName,
}: ListItemPlaceholderProps): ReactElement => (
  <article
    aria-busy
    className={classNames('relative flex flex-col items-start', padding)}
  >
    <TextPlaceholder className={classNames('w-4/5', textClassName)} />
    <TextPlaceholder className={classNames('w-4/5', textClassName)} />
    <TextPlaceholder className={classNames('w-2/5', textClassName)} />
  </article>
);
