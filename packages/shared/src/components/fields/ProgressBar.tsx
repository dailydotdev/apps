import React, { MeterHTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';

interface ProgressBarProps extends MeterHTMLAttributes<HTMLMeterElement> {
  percentage: number;
  className?: string;
}

export function ProgressBar({
  percentage,
  className,
}: ProgressBarProps): ReactElement {
  return (
    <meter
      className={classNames(
        'absolute left-0 h-1 appearance-none bg-accent-cabbage-default transition-[width]',
        className,
      )}
      style={{ width: `${percentage}%` }}
    />
  );
}
