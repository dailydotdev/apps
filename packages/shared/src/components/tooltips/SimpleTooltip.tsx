import React, { ReactElement, useMemo } from 'react';
import dynamicParent from '../../lib/dynamicParent';
import { getShouldLoadTooltip, BaseTooltipProps } from './BaseTooltip';

const BaseTooltipLoader = () =>
  import(/* webpackChunkName: "lazyTooltip" */ './BaseTooltip');

const TippyTooltip = dynamicParent<
  Omit<BaseTooltipProps, 'render' | 'allowHTML'>
>(() => BaseTooltipLoader().then((mod) => mod.BaseTooltip), React.Fragment);

interface TooltipProps extends Omit<BaseTooltipProps, 'render'> {
  disableTooltip?: boolean;
}

export function SimpleTooltip({
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

export default SimpleTooltip;
