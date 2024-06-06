import React, { HTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';

export const ElementPlaceholder = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): ReactElement => (
  <div
    className={classNames(
      className,
      'relative overflow-hidden bg-surface-float',
    )}
    {...props}
  />
);
