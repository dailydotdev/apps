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
>(function TooltipLinkWrapper({ className, onMouseUp, ...props }, ref) {
  return (
    // The span is not interactive itself: the link inside is. Its handlers
    // are the Tooltip's trigger props plus the mouse-up blur below.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <span
      ref={ref}
      {...props}
      aria-label={undefined}
      className={classNames('flex', className)}
      // Tooltip blurs its trigger on mouse up so a clicked link does not keep
      // focus and reopen the tooltip when the window regains focus. The
      // trigger is this span, which never holds focus, so blur the link.
      onMouseUp={(event) => {
        onMouseUp?.(event);
        const { activeElement } = event.currentTarget.ownerDocument;
        if (
          activeElement instanceof HTMLElement &&
          event.currentTarget.contains(activeElement)
        ) {
          activeElement.blur();
        }
      }}
    />
  );
});
