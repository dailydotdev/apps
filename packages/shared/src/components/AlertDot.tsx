import React, { CSSProperties, forwardRef, ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../lib/classed';

const Dot = classed('div', 'absolute w-2.5 h-2.5 rounded-full');

export enum AlertColor {
  BrightRed = 'bg-theme-status-error',
  Fill = 'bg-theme-status-fill',
  Success = 'bg-theme-status-success',
  Cabbage = 'bg-theme-color-cabbage',
}

interface AlertDotProps {
  color: AlertColor;
  className?: string;
  style?: CSSProperties;
}

export const AlertDot = forwardRef<HTMLElement, AlertDotProps>(
  function AlertDot(
    { color, className, ...props }: AlertDotProps,
    ref,
  ): ReactElement {
    return (
      <Dot ref={ref} {...props} className={classNames(color, className)} />
    );
  },
);
