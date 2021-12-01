import React, { ReactElement, useMemo } from 'react';
import dynamicParent from '../../lib/dynamicParent';
import { getShouldLoadTooltip, BaseTooltipProps } from './BaseTooltip';

const BaseTooltipLoader = () =>
  import(/* webpackChunkName: "lazyTooltip" */ './BaseTooltip');

export type SimpleTooltipProps = Pick<
  BaseTooltipProps,
  'content' | 'children' | 'placement'
>;

const TippyTooltip = dynamicParent<SimpleTooltipProps>(
  () => BaseTooltipLoader().then((mod) => mod.BaseTooltip),
  React.Fragment,
);

export function SimpleTooltip({
  children,
  content,
  ...props
}: SimpleTooltipProps): ReactElement {
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

  const onTrigger = (_, event) => {
    if (event.type !== 'focus') {
      shouldShow = true;
    }
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
      shouldLoad={getShouldLoadTooltip()}
      {...props}
      content={content}
      onTrigger={onTrigger}
      onUntrigger={onUntrigger}
      onShow={() => shouldShow}
    >
      {component}
    </TippyTooltip>
  );
}

export default SimpleTooltip;
