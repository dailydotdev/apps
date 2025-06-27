import type { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import './style.css';
import type {
  DropdownMenuContentProps as RadixDropdownMenuContentProps,
  DropdownMenuProps,
} from '@radix-ui/react-dropdown-menu';
import {
  DropdownMenu as DropdownMenuRoot,
  DropdownMenuContent as DropdownMenuContentRoot,
  DropdownMenuPortal,
  DropdownMenuTrigger as DropdownMenuTriggerRoot,
  DropdownMenuItem as DropdownMenuItemRoot,
} from '@radix-ui/react-dropdown-menu';
import classed from '../../lib/classed';
import useDebounceFn from '../../hooks/useDebounceFn';

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

export const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ children, ...props }) => {
    const [open, setOpen] = useState(false);

    const [handleScroll] = useDebounceFn(() => {
      props.onOpenChange?.(false);
      setOpen(false);
    }, 50);

    useEffect(() => {
      document.addEventListener('scroll', handleScroll, true);

      return () => {
        document.removeEventListener('scroll', handleScroll, true);
      };
    }, [handleScroll]);

    return (
      <DropdownMenuRoot
        open={props.open || open}
        onOpenChange={(value) => {
          props.onOpenChange?.(value);
          setOpen(value);
        }}
        modal={false}
        {...props}
      >
        {children}
      </DropdownMenuRoot>
    );
  },
);
DropdownMenu.displayName = 'DropdownMenu';

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
