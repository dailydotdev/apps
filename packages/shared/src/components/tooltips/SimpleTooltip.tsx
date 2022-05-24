import React, { ReactElement, useMemo } from 'react';
import dynamicParent from '../../lib/dynamicParent';
import { getShouldLoadTooltip, TooltipProps } from './BaseTooltip';

const BaseTooltipLoader = () =>
  import(/* webpackChunkName: "lazyTooltip" */ './BaseTooltip');

const TippyTooltip = dynamicParent<TooltipProps>(
  () => BaseTooltipLoader().then((mod) => mod.BaseTooltip),
  React.Fragment,
);

export function SimpleTooltip({
  children,
  content,
  onTrigger,
  onShow,
  ...props
}: TooltipProps): ReactElement {
  /**
   * We introduced the `shouldShow` variable to manage a re-focus issue
   * The old implementation would re-focus the tooltip whenever a modal would close
   * Read more on the PR: https://github.com/dailydotdev/apps/pull/713
   */
  let shouldShow = true;
  const component = useMemo(() => {
    const tooltipProps = {};
    if (typeof content === 'string') {
      tooltipProps['aria-label'] = content;
    }

    return React.cloneElement(children, {
      ...tooltipProps,
      ...children.props,
    });
  }, [children]);

  const onTooltipTrigger = (_, event) => {
    shouldShow = event.type !== 'focus';

    onTrigger?.(_, event);
  };

  const onUntrigger = (_, event) => {
    const eventPath = event.path || event.composedPath?.();
    const bodyPath = eventPath.filter((path) => document.body === path)[0];
    if (bodyPath?.className === 'ReactModal__Body--open') {
      shouldShow = false;
      return;
    }
    shouldShow = true;
  };

  const onTooltipShow = (_) => {
    if (shouldShow) {
      return onShow?.(_);
    }

    return false;
  };

  return (
    <TippyTooltip
      {...props}
      shouldLoad={getShouldLoadTooltip()}
      content={content}
      onTrigger={onTooltipTrigger}
      onUntrigger={onUntrigger}
      onShow={onTooltipShow}
    >
      {component}
    </TippyTooltip>
  );
}

export default SimpleTooltip;
