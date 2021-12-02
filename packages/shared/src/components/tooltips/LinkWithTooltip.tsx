import React, { ReactElement, useMemo, useState } from 'react';
import Link, { LinkProps } from 'next/link';
import { BaseTooltip, getShouldLoadTooltip } from './BaseTooltip';
import { SimpleTooltipProps } from './SimpleTooltip';

interface LinkWithTooltipProps extends LinkProps {
  children?: ReactElement;
  tooltip: SimpleTooltipProps;
}

export function LinkWithTooltip({
  children,
  tooltip,
  ...props
}: LinkWithTooltipProps): ReactElement {
  const [element, setElement] = useState<Element>();
  const component = useMemo(
    () =>
      React.cloneElement(children, {
        ...children.props,
        'aria-label': tooltip.content,
        ref: (el: Element) => setElement(el),
      }),
    [children],
  );

  return (
    <>
      {getShouldLoadTooltip() && (
        <BaseTooltip {...tooltip} reference={element} />
      )}
      <Link {...props}>{component}</Link>
    </>
  );
}
