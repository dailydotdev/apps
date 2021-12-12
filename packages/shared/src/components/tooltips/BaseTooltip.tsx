import React, { useState, ReactElement, Ref } from 'react';
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

const DEFAULT_DELAY_MS = 300;
const DEFAULT_DURATION = 200;

export const getShouldLoadTooltip = (): boolean =>
  !isTouchDevice() && !isTesting;

export interface TooltipProps
  extends Pick<
    BaseTooltipProps,
    | 'content'
    | 'children'
    | 'placement'
    | 'delay'
    | 'interactive'
    | 'onTrigger'
    | 'duration'
  > {
  container?: Omit<BaseTooltipContainerProps, 'placement' | 'children'>;
}

export interface BaseTooltipProps extends TippyProps {
  container?: Omit<BaseTooltipContainerProps, 'children'>;
  placement?: TooltipPosition;
}

export function BaseTooltip(
  {
    render,
    arrow,
    placement = 'top',
    delay = DEFAULT_DELAY_MS,
    duration = DEFAULT_DURATION,
    container = {},
    children,
    content,
    ...props
  }: BaseTooltipProps,
  ref?: Ref<Element>,
): ReactElement {
  const [mounted, setMounted] = useState(false);

  const lazyPlugin = {
    fn: () => ({
      onMount: () => setMounted(true),
      onHidden: () => setMounted(false),
    }),
  };

  return (
    <Tippy
      ref={ref}
      {...props}
      plugins={[lazyPlugin]}
      placement={placement}
      delay={delay}
      duration={duration}
      className={styles.tippyTooltip}
      allowHTML
      content={
        !content ? (
          <></>
        ) : (
          <BaseTooltipContainer
            {...container}
            placement={placement}
            arrowClassName={classNames(
              styles.tippyTooltipArrow,
              container.arrowClassName,
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
