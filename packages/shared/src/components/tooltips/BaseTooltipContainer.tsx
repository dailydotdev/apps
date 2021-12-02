import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

export interface BaseTooltipContainerProps {
  arrow?: boolean;
  children: ReactNode;
  className?: string;
  arrowClassName?: string;
  placement?: TooltipPosition;
  paddingClassName?: string;
  roundedClassName?: string;
}

export function BaseTooltipContainer({
  className,
  arrow = true,
  arrowClassName,
  placement = 'top',
  paddingClassName = 'py-1 px-3',
  roundedClassName = 'rounded-10',
  children,
}: BaseTooltipContainerProps): ReactElement {
  return (
    <div
      data-popper-placement={placement}
      className={classNames(
        'relative flex flex-row items-center bg-theme-label-primary text-theme-label-invert typo-subhead',
        paddingClassName,
        roundedClassName,
        className,
      )}
    >
      {children}
      {arrow && (
        <div
          data-popper-arrow
          className={classNames(arrowClassName, 'bg-theme-label-primary')}
        />
      )}
    </div>
  );
}

export default BaseTooltipContainer;
