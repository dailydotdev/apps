import React from 'react';
import type { ReactElement, ComponentProps } from 'react';
import classNames from 'classnames';
import { StarIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

export interface StarsProps extends ComponentProps<'div'> {
  count?: number;
}

export function Stars({
  count = 5,
  className,
  ...attrs
}: StarsProps): ReactElement {
  return (
    <div
      aria-label={`${count} stars rating`}
      {...attrs}
      className={classNames('flex items-center', className)}
    >
      {Array.from({ length: count }, (_, index) => (
        <StarIcon
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          size={IconSize.Small}
          secondary
          className="text-accent-cheese-default"
          aria-hidden
        />
      ))}
    </div>
  );
}
