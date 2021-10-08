import React, { useState, forwardRef, ReactElement } from 'react';
import Tippy, { TippyProps } from '@tippyjs/react';
import classNames from 'classnames';
import styles from './LazyTooltip.module.css';
import { isTesting } from '../../lib/constants';

const DEFAULT_DELAY_MS = 600;
const DEFAULT_OUT_ANIMATION = 200;

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

export interface LazyTooltipProps extends TippyProps {
  arrow?: boolean;
  content: string;
  placement?: TooltipPosition;
}

export default forwardRef<Element, LazyTooltipProps>(function LazyTippy(
  { arrow = true, placement = 'top', ...props },
  ref,
): ReactElement {
  const [mounted, setMounted] = useState(false);
  const [unMounting, setUnMounting] = useState(false);

  const onHide = ({ unmount }) => {
    setUnMounting(true);
    setTimeout(() => {
      setUnMounting(false);
      setMounted(false);
      unmount();
    }, DEFAULT_OUT_ANIMATION);
  };

  const computedProps = { ...props };

  computedProps.delay = computedProps.delay || DEFAULT_DELAY_MS;
  computedProps.plugins = [...(props.plugins || [])];

  if (props.render) {
    computedProps.render = (...args) =>
      mounted || isTesting ? props.render(...args) : '';
  } else {
    computedProps.children = React.cloneElement(computedProps.children, {
      ...computedProps.children.props,
      'aria-label': props.content,
    });
    computedProps.render = () => (mounted || isTesting ? props.content : '');
  }

  return (
    <Tippy
      ref={ref}
      {...computedProps}
      placement={placement}
      onHide={onHide}
      onMount={() => setMounted(true)}
      render={(...args) => (
        <div
          data-popper-placement={placement}
          className={classNames(
            styles.tippyTooltip,
            'relative flex items-center py-1 px-3 rounded-10 bg-theme-label-primary text-theme-label-invert typo-subhead',
            unMounting && styles.unMount,
            computedProps.className,
          )}
        >
          {computedProps.render(...args)}
          {arrow && (
            <div
              data-popper-arrow
              className={classNames(
                styles.tippyTooltipArrow,
                'bg-theme-label-primary',
              )}
            />
          )}
        </div>
      )}
    />
  );
});
