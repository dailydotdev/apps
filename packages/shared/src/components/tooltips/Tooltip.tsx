import React, { ReactElement, useMemo } from 'react';
import dynamicParent from '../../lib/dynamicParent';
import { getShouldLoadTooltip, LazyTooltipProps } from './LazyTooltip';

const LazyTooltipLoader = () =>
  import(/* webpackChunkName: "lazyTooltip" */ './LazyTooltip');

const TippyTooltip = dynamicParent<
  Omit<LazyTooltipProps, 'render' | 'allowHTML'>
>(() => LazyTooltipLoader().then((mod) => mod.default), React.Fragment);

interface TooltipProps extends Omit<LazyTooltipProps, 'render'> {
  disableTooltip?: boolean;
}

export function Tooltip({
  children,
  content,
  allowHTML,
  disableTooltip,
  ...props
}: TooltipProps): ReactElement {
  const component = useMemo(
    () =>
      React.cloneElement(children, {
        ...children.props,
        'aria-label': allowHTML ? children.props['aria-label'] : content,
      }),
    [children],
  );

  return (
    <TippyTooltip
      shouldLoad={getShouldLoadTooltip(disableTooltip)}
      {...props}
      content={content}
    >
      {component}
    </TippyTooltip>
  );
}

export default Tooltip;
