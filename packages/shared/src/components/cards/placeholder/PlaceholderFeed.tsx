import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { PlaceholderList } from './PlaceholderList';
import type { PlaceholderProps } from './common/common';

/** A phone's worth of list rows before the first page arrives. */
export const PHONE_FEED_PLACEHOLDER_ROWS = 4;

interface PlaceholderFeedProps extends PlaceholderProps {
  rows?: number;
}

export const PlaceholderFeed = ({
  className,
  rows = PHONE_FEED_PLACEHOLDER_ROWS,
  ...props
}: PlaceholderFeedProps): ReactElement => (
  <div
    aria-busy
    className={classNames('mt-2 flex w-full flex-col', className)}
    {...props}
  >
    {Array.from({ length: rows }, (_, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <PlaceholderList key={i} />
    ))}
  </div>
);
