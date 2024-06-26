import React, { FunctionComponent, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import styles from './BaseTooltip.module.css';

export type TooltipPosition =
  | 'top'
  | 'top-start'
  | 'right'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'left'
  | 'bottom-end';

export type TooltipArrowProps = {
  'data-popper-arrow': true;
  className: string;
};

export interface BaseTooltipContainerProps {
  showArrow?: boolean;
  children: ReactNode;
  className?: string;
  ArrowComponent?: FunctionComponent<TooltipArrowProps>;
  placement?: TooltipPosition;
  paddingClassName?: string;
  roundedClassName?: string;
  textClassName?: string;
  bgClassName?: string;
}

const DefaultArrow = (arrowProps) => {
  return <div {...arrowProps} />;
};

export function BaseTooltipContainer({
  className,
  showArrow = true,
  ArrowComponent,
  placement = 'top',
  paddingClassName = 'py-1 px-3',
  roundedClassName = 'rounded-10',
  bgClassName = 'bg-text-primary',
  textClassName = 'text-surface-invert typo-subhead',
  children,
}: BaseTooltipContainerProps): ReactElement {
  const Arrow = ArrowComponent ?? DefaultArrow;

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
      {!!showArrow && (
        <Arrow
          data-popper-arrow
          className={classNames(styles.tippyTooltipArrow, bgClassName)}
        />
      )}
    </div>
  );
}

export default BaseTooltipContainer;
