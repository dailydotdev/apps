import React, { ReactElement, useMemo } from 'react';
import { isTesting } from '../../lib/constants';
import dynamicParent from '../../lib/dynamicParent';
import { isTouchDevice } from '../../lib/tooltip';
import { LazyTooltipProps } from './LazyTooltip';

const LazyTooltipLoader = () =>
  import(/* webpackChunkName: "lazyTooltip" */ './LazyTooltip');

const TippyTooltip = dynamicParent(
  () => LazyTooltipLoader().then((mod) => mod.default),
  React.Fragment,
);

export function Tooltip({
  children,
  content,
  ...props
}: LazyTooltipProps): ReactElement {
  const component = useMemo(
    () =>
      React.cloneElement(children, {
        ...children.props,
        'aria-label': content,
      }),
    [children],
  );

  const shouldLoad = !isTouchDevice() && !isTesting;

  return (
    <TippyTooltip shouldLoad={shouldLoad} {...props} content={content}>
      {component}
    </TippyTooltip>
  );
}

export default Tooltip;
