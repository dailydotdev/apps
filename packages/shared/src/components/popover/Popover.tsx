import React, { forwardRef } from 'react';
import classNames from 'classnames';
import type { PopoverContentProps } from '@radix-ui/react-popover';
import {
  PopoverContent as PopoverContentRoot,
  PopoverPortal,
} from '@radix-ui/react-popover';

import './style.css';

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, ...props }, ref) => {
    return (
      <PopoverPortal>
        <PopoverContentRoot
          ref={ref}
          {...props}
          className={classNames('PopoverContent', props.className)}
        >
          {children}
        </PopoverContentRoot>
      </PopoverPortal>
    );
  },
);
PopoverContent.displayName = 'PopoverContent';
