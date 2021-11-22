import React, { ReactElement } from 'react';
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
  ...props
}: LazyTooltipProps): ReactElement {
  return (
    <TippyTooltip shouldLoad={!isTouchDevice()} {...props}>
      {children}
    </TippyTooltip>
  );
}

export default Tooltip;
