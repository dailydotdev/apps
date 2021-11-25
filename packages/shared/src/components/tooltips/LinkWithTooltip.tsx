import React, { ReactElement, useMemo, useRef } from 'react';
import Link, { LinkProps } from 'next/link';
import {
  BaseTooltip,
  BaseTooltipProps,
  getShouldLoadTooltip,
} from './BaseTooltip';

interface LinkWithTooltipProps extends LinkProps {
  children?: ReactElement;
  tooltip: BaseTooltipProps;
}

function LinkWithTooltip({
  children,
  tooltip,
  ...props
}: LinkWithTooltipProps): ReactElement {
  const ref = useRef();
  const component = useMemo(
    () =>
      React.cloneElement(children, {
        ...children.props,
        'aria-label': tooltip.content,
        ref,
      }),
    [children],
  );

  return (
    <>
      {getShouldLoadTooltip() && <BaseTooltip {...tooltip} reference={ref} />}
      <Link {...props}>{component}</Link>
    </>
  );
}

export default LinkWithTooltip;
