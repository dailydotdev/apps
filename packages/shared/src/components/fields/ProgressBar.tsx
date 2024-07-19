import React, { MeterHTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';
import ConditionalWrapper from '../ConditionalWrapper';

interface ClassName {
  wrapper?: string;
  bar?: string;
  barColor?: string;
}

interface ProgressBarProps
  extends Omit<MeterHTMLAttributes<HTMLMeterElement>, 'className'> {
  percentage: number;
  className?: ClassName;
  shouldShowBg?: boolean;
}

export function ProgressBar({
  percentage,
  className = {},
  shouldShowBg,
}: ProgressBarProps): ReactElement {
  return (
    <ConditionalWrapper
      condition={shouldShowBg}
      wrapper={(component) => (
        <span
          className={classNames(
            'flex w-full overflow-hidden bg-accent-pepper-subtler',
            className?.wrapper,
          )}
        >
          {component}
        </span>
      )}
    >
      <meter
        className={classNames(
          'appearance-none transition-[width]',
          className?.bar,
          className?.barColor ?? 'bg-accent-cabbage-default',
        )}
        style={{ width: `${percentage}%` }}
      />
    </ConditionalWrapper>
  );
}
