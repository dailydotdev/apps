import classNames from 'classnames';
import React, { ReactElement } from 'react';

import classed from '../lib/classed';
import { Button, ButtonProps, ButtonVariant } from './buttons/Button';

export const EmptyScreenContainer = classed(
  'div',
  'flex flex-col justify-center items-center px-6 w-full max-w-screen-tablet h-[calc(100vh-3rem)] max-h-full',
);

export const EmptyScreenTitle = classed('h2', 'my-4 text-center typo-title1');

export const EmptyScreenDescription = classed(
  'p',
  'p-0 m-0 text-center text-text-secondary typo-body',
);

export const EmptyScreenButton = ({
  className,
  children,
  variant = ButtonVariant.Primary,
  ...props
}: ButtonProps<'a' | 'button'>): ReactElement => (
  <Button
    variant={variant}
    className={classNames('mt-10', className)}
    {...props}
  >
    {children}
  </Button>
);

export const EmptyScreenIcon = {
  className: 'text-text-disabled',
  style: { fontSize: '5rem', width: 'auto', height: 'auto' },
};
