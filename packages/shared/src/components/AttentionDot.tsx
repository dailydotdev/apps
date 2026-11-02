import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { WithClassNameProps } from './utilities/common';
import { AlertColor } from './AlertDot';

export const AttentionDot = ({
  className,
}: WithClassNameProps): ReactElement => (
  <span
    aria-hidden
    data-testid="attention-dot"
    className={classNames(
      'pointer-events-none absolute right-1 top-1 size-2 rounded-full ring-2 ring-background-default',
      AlertColor.Cabbage,
      className,
    )}
  />
);
