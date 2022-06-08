import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';

export type TooltipPosition =
  | 'top'
  | 'top-start'
  | 'right'
  | 'bottom'
  | 'bottom-start'
  | 'left';

export interface BaseTooltipContainerProps {
  arrow?: boolean;
  children: ReactNode;
  className?: string;
  arrowClassName?: string;
  placement?: TooltipPosition;
  paddingClassName?: string;
  roundedClassName?: string;
  textClassName?: string;
  bgClassName?: string;
}

export function BaseTooltipContainer({
  className,
  arrow = true,
  arrowClassName,
  placement = 'top',
  paddingClassName = 'py-1 px-3',
  roundedClassName = 'rounded-10',
  bgClassName = 'bg-theme-label-primary',
  textClassName = 'text-theme-label-invert typo-subhead',
  children,
}: BaseTooltipContainerProps): ReactElement {
  return (
    <div
      data-popper-placement={placement}
      className={classNames(
        'relative flex flex-row items-center',
        textClassName,
        bgClassName,
        paddingClassName,
        roundedClassName,
        className,
      )}
    >
      {children}
      {arrow && (
        <div
          data-popper-arrow
          className={classNames(arrowClassName, bgClassName)}
        />
      )}
    </div>
  );
}

export default BaseTooltipContainer;
