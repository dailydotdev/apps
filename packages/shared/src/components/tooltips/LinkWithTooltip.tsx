import React, { ReactElement, useMemo, useState } from 'react';
import Link, { LinkProps } from 'next/link';
import { BaseTooltip, getShouldLoadTooltip, TooltipProps } from './BaseTooltip';

export interface LinkWithTooltipProps extends LinkProps {
  children?: ReactElement;
  tooltip: TooltipProps;
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
        'aria-label':
          typeof tooltip.content === 'string' ? tooltip.content : undefined,
        ref: (el: Element) => setElement(el),
      }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
