import React, { ReactElement, useMemo } from 'react';
import { isTesting } from '../../lib/constants';
import dynamicParent from '../../lib/dynamicParent';
import { isTouchDevice } from '../../lib/tooltip';
import { LazyTooltipProps } from './LazyTooltip';

const LazyTooltipLoader = () =>
  import(/* webpackChunkName: "lazyTooltip" */ './LazyTooltip');

const TippyTooltip = dynamicParent<
  Omit<LazyTooltipProps, 'render' | 'allowHTML'>
>(() => LazyTooltipLoader().then((mod) => mod.default), React.Fragment);

interface TooltipProps extends Omit<LazyTooltipProps, 'render'> {
  disableTooltip?: boolean;
  passRef?: boolean;
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

  const shouldLoad = !isTouchDevice() && !isTesting && !disableTooltip;

  return (
    <TippyTooltip shouldLoad={shouldLoad} {...props} content={content}>
      {component}
    </TippyTooltip>
  );
}

export default Tooltip;
