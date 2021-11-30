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
  const component = useMemo(
    () =>
      React.cloneElement(children, {
        ...children.props,
        'aria-label': typeof content === 'string' && content,
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
