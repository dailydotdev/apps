import type { ComponentProps, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

export function Anchor({
  className,
  children,
  ...props
}: ComponentProps<'a'>): ReactElement {
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
