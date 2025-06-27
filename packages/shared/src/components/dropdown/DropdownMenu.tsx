import type { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
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

export const DropdownMenu = React.forwardRef(({ children }, forwardedRef) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setOpen(false);
    };

    document.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  return (
    <DropdownMenuRoot
      open={open}
      ref={forwardedRef}
      onOpenChange={setOpen}
      modal={false}
    >
      {children}
    </DropdownMenuRoot>
  );
});
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
