import React, { CSSProperties, ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../lib/classed';

const Dot = classed('div', 'absolute rounded-full');

export enum AlertColor {
  BrightRed = 'bg-theme-status-error',
  Fill = 'bg-theme-status-fill',
  Success = 'bg-theme-status-success',
  Cabbage = 'bg-theme-color-cabbage',
}

export enum AlertDotSize {
  XSmall = 'x-small',
  Small = 'small',
}

interface AlertDotProps {
  color: AlertColor;
  className?: string;
  style?: CSSProperties;
  size?: AlertDotSize;
}

const alertSizeMap: Record<AlertDotSize, string> = {
  [AlertDotSize.XSmall]: 'w-2 h-2',
  [AlertDotSize.Small]: 'w-2.5 h-2.5',
};

export const AlertDot = function AlertDot({
  color,
  className,
  size = AlertDotSize.Small,
  ...props
}: AlertDotProps): ReactElement {
  return (
    <Dot
      {...props}
      className={classNames(color, alertSizeMap[size], className)}
    />
  );
};
