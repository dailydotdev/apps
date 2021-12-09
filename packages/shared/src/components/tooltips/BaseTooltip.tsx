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
  const [mounted, setMounted] = useState(false);
  const [unMounting, setUnMounting] = useState(false);
  const onHide = ({ unmount }) => {
    if (disableOutAnimation) {
      return;
    }
    setUnMounting(true);
    setTimeout(() => {
      setUnMounting(false);
      unmount();
    }, DEFAULT_OUT_ANIMATION);
  };

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
      onHide={onHide}
      delay={delay}
      allowHTML
      animation={!(disableInAnimation && disableOutAnimation)}
      content={
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
      }
    >
      {children}
    </Tippy>
  );
}
