import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { StarIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

export interface StarsProps {
  count?: number;
  className?: string;
}

export function Stars({ count = 5, className }: StarsProps): ReactElement {
  return (
    <div className={classNames('flex items-center', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <StarIcon
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          size={IconSize.Small}
          secondary
          className="text-accent-cheese-default"
        />
      ))}
    </div>
  );
}
