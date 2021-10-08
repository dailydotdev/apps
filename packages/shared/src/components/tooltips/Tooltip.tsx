import React, { forwardRef, ReactElement, useMemo, useState } from 'react';
import dynamicParent from '../../lib/dynamicParent';
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
  const [hovered, setHovered] = useState(false);

  const onHover = () => {
    if (hovered) return;

    setHovered(true);
  };

  const events = !hovered ? { onMouseOver: onHover, onFocus: onHover } : {};

  const Component = useMemo(
    () =>
      forwardRef<unknown, unknown>(function Cloned(childProps, ref) {
        return React.cloneElement(children, {
          ref,
          ...childProps,
          ...events,
        });
      }),
    [children],
  );

  return (
    <TippyTooltip shouldLoad={hovered} {...props}>
      <Component />
    </TippyTooltip>
  );
}

export default Tooltip;
