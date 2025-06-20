import type { ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import './style.css';
import type { DropdownMenuContentProps as RadixDropdownMenuContentProps } from '@radix-ui/react-dropdown-menu';
import {
  DropdownMenu as DropdownMenuRoot,
  DropdownMenuContent as DropdownMenuContentRoot,
  DropdownMenuPortal,
  DropdownMenuTrigger as DropdownMenuTriggerRoot,
  DropdownMenuItem as DropdownMenuItemRoot,
} from '@radix-ui/react-dropdown-menu';
import classed from '../../lib/classed';

export const DropdownMenu = DropdownMenuRoot;
export const DropdownMenuTrigger = DropdownMenuTriggerRoot;

export const DropdownMenuItem = classed(
  DropdownMenuItemRoot,
  'DropdownMenuItem',
);

interface DropdownMenuContentProps
  extends Omit<RadixDropdownMenuContentProps, 'className'> {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ children, className, align = 'end', ...props }, forwardedRef) => {
  return (
    <DropdownMenuPortal>
      <DropdownMenuContentRoot
        {...props}
        ref={forwardedRef}
        className={classNames('DropdownMenuContent', className)}
        align={align}
      >
        {children}
      </DropdownMenuContentRoot>
    </DropdownMenuPortal>
  );
});

DropdownMenuContent.displayName = 'DropdownMenuContent';
