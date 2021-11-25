import React, { ReactElement, useMemo } from 'react';
import dynamicParent from '../../lib/dynamicParent';
import { getShouldLoadTooltip, BaseTooltipProps } from './BaseTooltip';

const BaseTooltipLoader = () =>
  import(/* webpackChunkName: "lazyTooltip" */ './BaseTooltip');

const TippyTooltip = dynamicParent<
  Omit<BaseTooltipProps, 'render' | 'allowHTML'>
>(() => BaseTooltipLoader().then((mod) => mod.BaseTooltip), React.Fragment);

type TooltipProps = Omit<BaseTooltipProps, 'render'>;

export function SimpleTooltip({
  children,
  content,
  allowHTML,
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
      shouldLoad={getShouldLoadTooltip()}
      {...props}
      content={content}
    >
      {component}
    </TippyTooltip>
  );
}

export default SimpleTooltip;
