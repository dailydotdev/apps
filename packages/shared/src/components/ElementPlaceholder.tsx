import classNames from 'classnames';
import React, { HTMLAttributes, ReactElement } from 'react';

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
