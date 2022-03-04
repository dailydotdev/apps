import React, { CSSProperties, ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../lib/classed';

const Dot = classed('div', 'absolute w-2.5 h-2.5 rounded-full');

export enum AlertColor {
  BrightRed = 'bg-theme-status-error',
  Fill = 'bg-theme-status-fill',
  Success = 'bg-theme-status-success',
}

interface AlertDotProps {
  color: AlertColor;
  className?: string;
  style?: CSSProperties;
}

export function AlertDot({
  color,
  className,
  ...props
}: AlertDotProps): ReactElement {
  return <Dot {...props} className={classNames(color, className)} />;
}
