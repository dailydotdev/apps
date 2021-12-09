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
  ...props
}: TooltipProps): ReactElement {
  /**
   * We introduced the `shouldShow` variable to manage a re-focus issue
   * The old implementation would re-focus the tooltip whenever a modal would close
   * Read more on the PR: https://github.com/dailydotdev/apps/pull/713
   */
  let shouldShow = true;
  const component = useMemo(
    () =>
      React.cloneElement(children, {
        ...children.props,
        'aria-label': typeof content === 'string' && content,
      }),
    [children],
  );

  const onTooltipTrigger = (_, event) => {
    if (event.type !== 'focus') {
      shouldShow = true;
    }
    onTrigger?.(_, event);
  };

  const onUntrigger = (_, event) => {
    const bodyPath = event.path.filter((path) => document.body === path)[0];
    if (bodyPath.className === 'ReactModal__Body--open') {
      shouldShow = false;
      return;
    }
    shouldShow = true;
  };

  return (
    <TippyTooltip
      {...props}
      shouldLoad={getShouldLoadTooltip()}
      content={content}
      onTrigger={onTooltipTrigger}
      onUntrigger={onUntrigger}
      onShow={() => shouldShow}
    >
      {component}
    </TippyTooltip>
  );
}

export default SimpleTooltip;
