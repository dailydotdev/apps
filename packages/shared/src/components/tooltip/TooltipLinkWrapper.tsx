import type { HTMLAttributes } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';

// Tooltip hands its trigger props (handlers, ref, data-state) to its direct
// child. Link is next/link in legacyBehavior, which drops them, so a Tooltip
// around a Link never opens. Put this between them. It leaves out the
// Tooltip's aria-label: the link names itself, and a label on a span is
// invalid ARIA.
export const TooltipLinkWrapper = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement>
>(function TooltipLinkWrapper({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      {...props}
      aria-label={undefined}
      className={classNames('flex', className)}
    />
  );
});
