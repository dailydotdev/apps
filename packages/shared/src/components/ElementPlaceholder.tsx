import type { HTMLAttributes, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

export const ElementPlaceholder = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): ReactElement => (
  <div
    className={classNames(
      className,
      'bg-surface-float relative overflow-hidden',
    )}
    {...props}
  />
);
