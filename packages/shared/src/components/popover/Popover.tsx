import React, { forwardRef } from 'react';
import type { PopoverContentProps as PopoverContentPropsRoot } from '@radix-ui/react-popover';
import {
  PopoverContent as PopoverContentRoot,
  PopoverPortal,
} from '@radix-ui/react-popover';

import classNames from 'classnames';

export type PopoverContentProps = PopoverContentPropsRoot & {
  sameWidthAsAnchor?: boolean;
};

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, sameWidthAsAnchor, ...props }, ref) => {
    return (
      <PopoverPortal>
        <PopoverContentRoot
          ref={ref}
          {...props}
          className={classNames(
            sameWidthAsAnchor &&
              // the available height runs to the viewport edge, so a list long
              // enough to hit the cap would sit flush against it
              'max-h-[calc(var(--radix-popover-content-available-height)-1rem)] w-[var(--radix-popover-trigger-width)]',
            props.className,
          )}
        >
          {children}
        </PopoverContentRoot>
      </PopoverPortal>
    );
  },
);
PopoverContent.displayName = 'PopoverContent';
