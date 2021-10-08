import React, { useState, forwardRef, ReactElement } from 'react';
import Tippy, { TippyProps } from '@tippyjs/react';
import classNames from 'classnames';
import styles from './LazyTooltip.module.css';
import { TooltipContainer, TooltipPosition } from './TooltipContainer';

const DEFAULT_DELAY_MS = 600;
const DEFAULT_OUT_ANIMATION = 200;

export interface LazyTooltipProps extends TippyProps {
  arrow?: boolean;
  content: string;
  placement?: TooltipPosition;
}

export default forwardRef<Element, LazyTooltipProps>(function LazyTippy(
  {
    render,
    arrow,
    placement = 'top',
    delay = DEFAULT_DELAY_MS,
    className,
    children,
    ...props
  },
  ref,
): ReactElement {
  const [unMounting, setUnMounting] = useState(false);
  const tooltip = {
    render: null,
    children: null,
  };

  const onHide = ({ unmount }) => {
    setUnMounting(true);
    setTimeout(() => {
      setUnMounting(false);
      unmount();
    }, DEFAULT_OUT_ANIMATION);
  };

  if (!render) {
    tooltip.children = React.cloneElement(children, {
      ...children.props,
      'aria-label': props.content,
    });
    tooltip.render = () => props.content;
  }

  const renderer = tooltip.render || render;

  return (
    <Tippy
      ref={ref}
      {...props}
      placement={placement}
      onHide={onHide}
      delay={delay}
      render={(...args) => (
        <TooltipContainer
          arrow={arrow}
          arrowClassName={styles.tippyTooltipArrow}
          placement={placement}
          className={classNames(
            styles.tippyTooltip,
            unMounting && styles.unMount,
            className,
          )}
        >
          {renderer(...args)}
        </TooltipContainer>
      )}
    >
      {tooltip.children || children}
    </Tippy>
  );
});
