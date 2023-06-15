import React, { useState, ReactElement, Ref } from 'react';
import Tippy, { TippyProps } from '@tippyjs/react';
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
    | 'appendTo'
    | 'content'
    | 'children'
    | 'placement'
    | 'delay'
    | 'interactive'
    | 'onTrigger'
    | 'onShow'
    | 'onHide'
    | 'duration'
    | 'visible'
    | 'offset'
    | 'trigger'
    | 'disabled'
    | 'showArrow'
    | 'sticky'
    | 'plugins'
    | 'zIndex'
    | 'onClickOutside'
  > {
  container?: Omit<
    BaseTooltipContainerProps,
    'placement' | 'children' | 'showArrow'
  >;
  forceLoad?: boolean;
}

export interface BaseTooltipProps extends Omit<TippyProps, 'arrow'> {
  container?: Omit<BaseTooltipContainerProps, 'children' | 'showArrow'>;
  placement?: TooltipPosition;
  disabled?: boolean;
  showArrow?: boolean;
}

export function BaseTooltip(
  {
    render,
    showArrow = true,
    placement = 'top',
    delay = DEFAULT_DELAY_MS,
    duration = DEFAULT_DURATION,
    container = {},
    disabled,
    children,
    content,
    ...props
  }: BaseTooltipProps,
  ref?: Ref<Element>,
): ReactElement {
  const [mounted, setMounted] = useState(false);

  const lazyPlugin = {
    fn: () => ({
      onMount: () => !disabled && setMounted(true),
      onHidden: () => setMounted(false),
    }),
  };

  return (
    <Tippy
      ref={ref}
      {...props}
      maxWidth=""
      plugins={[
        lazyPlugin,
        ...(Array.isArray(props.plugins) ? props.plugins : []),
      ]}
      placement={placement}
      delay={delay}
      duration={duration}
      className={styles.tippyTooltip}
      allowHTML
      arrow={false} // disable tippy arrow since we alway inject custom one through BaseTooltipContainer
      content={
        !content || disabled ? (
          <></>
        ) : (
          <BaseTooltipContainer
            {...container}
            showArrow={showArrow}
            placement={placement}
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
