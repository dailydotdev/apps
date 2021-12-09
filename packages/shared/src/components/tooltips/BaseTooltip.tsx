import React, { useState, ReactElement, Ref, useRef, useEffect } from 'react';
import Tippy, { TippyProps } from '@tippyjs/react';
import classNames from 'classnames';
import styles from './BaseTooltip.module.css';
import { isTouchDevice } from '../../lib/tooltip';
import { isTesting } from '../../lib/constants';
import {
  BaseTooltipContainer,
  BaseTooltipContainerProps,
  TooltipPosition,
} from './BaseTooltipContainer';

const DEFAULT_DELAY_MS = 400;
const DEFAULT_OUT_ANIMATION = 200;

export const getShouldLoadTooltip = (): boolean =>
  !isTouchDevice() && !isTesting;

export interface TooltipProps
  extends Pick<
    BaseTooltipProps,
    | 'content'
    | 'children'
    | 'placement'
    | 'delay'
    | 'disableInAnimation'
    | 'disableOutAnimation'
    | 'interactive'
    | 'onTrigger'
  > {
  container?: Omit<BaseTooltipContainerProps, 'placement' | 'children'>;
}

export interface BaseTooltipProps extends TippyProps {
  container?: Omit<BaseTooltipContainerProps, 'children'>;
  placement?: TooltipPosition;
  disableInAnimation?: boolean;
  disableOutAnimation?: boolean;
}

export function BaseTooltip(
  {
    render,
    arrow,
    placement = 'top',
    delay = DEFAULT_DELAY_MS,
    container = {},
    children,
    content,
    disableInAnimation,
    disableOutAnimation,
    ...props
  }: BaseTooltipProps,
  ref?: Ref<Element>,
): ReactElement {
  const timeoutRef = useRef<number>();
  const [mounted, setMounted] = useState(false);
  const [unMounting, setUnMounting] = useState(false);
  const onHide = ({ unmount }) => {
    if (disableOutAnimation || unMounting) {
      return;
    }

    setUnMounting(true);
    if (!timeoutRef.current) {
      timeoutRef.current = window.setTimeout(() => {
        setUnMounting(false);
        unmount();
        timeoutRef.current = null;
      }, DEFAULT_OUT_ANIMATION);
    }
  };

  const lazyPlugin = {
    fn: () => ({
      onMount: () => setMounted(true),
      onHidden: () => setMounted(false),
    }),
  };

  useEffect(
    () => () => timeoutRef.current && clearTimeout(timeoutRef.current),
    [timeoutRef],
  );

  return (
    <Tippy
      ref={ref}
      {...props}
      plugins={[lazyPlugin]}
      placement={placement}
      onHide={onHide}
      delay={delay}
      allowHTML
      animation={!(disableInAnimation && disableOutAnimation)}
      content={
        !content ? null : (
          <BaseTooltipContainer
            {...container}
            placement={placement}
            arrowClassName={classNames(
              styles.tippyTooltipArrow,
              container.arrowClassName,
            )}
            className={classNames(
              styles.tippyTooltip,
              !disableInAnimation && styles.animate,
              unMounting && styles.unMount,
              container.className,
            )}
          >
            {mounted && content}
          </BaseTooltipContainer>
        )
      }
    >
      {children}
    </Tippy>
  );
}
