import React, { CSSProperties, ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../lib/classed';

const Dot = classed('div', 'w-2 h-2 rounded-full');

export enum AlertColor {
  BrightRed = 'bg-theme-status-error',
  Fill = 'bg-theme-status-fill',
  Success = 'bg-theme-status-success',
  Cabbage = 'bg-theme-color-cabbage',
}

export enum AlertDotPosition {
  Absolute = 'absolute',
  Fixed = 'fixed',
}

interface AlertDotProps {
  color: AlertColor;
  className?: string;
  style?: CSSProperties;
  position?: AlertDotPosition;
}

export const AlertDot = function AlertDot({
  color,
  className,
  position = AlertDotPosition.Absolute,
  ...props
}: AlertDotProps): ReactElement {
  return <Dot {...props} className={classNames(color, className, position)} />;
};
