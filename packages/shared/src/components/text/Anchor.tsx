import classNames from 'classnames';
import React, { ReactElement } from 'react';

export function Anchor({
  className,
  children,
  ...props
}: JSX.IntrinsicElements['a']): ReactElement {
  return (
    <a
      {...props}
      className={classNames(
        'text-text-link underline hover:no-underline',
        className,
      )}
    >
      {children}
    </a>
  );
}
