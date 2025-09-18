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
              'max-h-[var(--radix-popover-content-available-height)] w-[var(--radix-popover-trigger-width)]',
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
