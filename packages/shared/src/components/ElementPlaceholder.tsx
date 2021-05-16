import React, { HTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';

export const ElementPlaceholder = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): ReactElement => (
  <div
    className={classNames(
      className,
      'element-placeholder relative overflow-hidden bg-theme-float',
    )}
    {...props}
  >
    <div className="absolute top-0 left-0 w-full h-full" />
  </div>
);
