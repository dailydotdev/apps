import React, { useState, ReactElement, Ref } from 'react';
import Tippy, { TippyProps } from '@tippyjs/react';
import classNames from 'classnames';
import styles from './LazyTooltip.module.css';
import { isTouchDevice } from '../../lib/tooltip';
import { isTesting } from '../../lib/constants';
import {
  TooltipContainer,
  TooltipContainerProps,
  TooltipPosition,
} from './TooltipContainer';

const DEFAULT_DELAY_MS = 400;
const DEFAULT_OUT_ANIMATION = 200;

export const getShouldLoadTooltip = (disableTooltip?: boolean): boolean =>
  !isTouchDevice() && !isTesting && !disableTooltip;

export interface LazyTooltipProps extends TippyProps {
  container?: Omit<TooltipContainerProps, 'children'>;
  placement?: TooltipPosition;
}

export default function LazyTippy(
  {
    render,
    arrow,
    placement = 'top',
    delay = DEFAULT_DELAY_MS,
    container,
    children,
    content,
    ...props
  }: LazyTooltipProps,
  ref?: Ref<Element>,
): ReactElement {
  const [unMounting, setUnMounting] = useState(false);
  const onHide = ({ unmount }) => {
    setUnMounting(true);
    setTimeout(() => {
      setUnMounting(false);
      unmount();
    }, DEFAULT_OUT_ANIMATION);
  };

  return (
    <Tippy
      ref={ref}
      {...props}
      placement={placement}
      onHide={onHide}
      delay={delay}
      allowHTML
      content={
        <TooltipContainer
          {...container}
          placement={placement}
          arrowClassName={styles.tippyTooltipArrow}
          className={classNames(
            styles.tippyTooltip,
            unMounting && styles.unMount,
          )}
        >
          {content}
        </TooltipContainer>
      }
    >
      {children}
    </Tippy>
  );
}
