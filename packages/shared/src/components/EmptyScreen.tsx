import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';

import classed from '../lib/classed';
import type { ButtonV2Props } from './buttons/ButtonV2';
import { ButtonV2, ButtonVariant } from './buttons/ButtonV2';

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
}: ButtonV2Props<'a' | 'button'>): ReactElement => (
  <ButtonV2
    variant={variant}
    className={classNames('mt-10', className)}
    {...props}
  >
    {children}
  </ButtonV2>
);

export const EmptyScreenIcon = {
  className: 'text-text-disabled',
  style: { fontSize: '5rem', width: 'auto', height: 'auto' },
};
