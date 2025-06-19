import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import './style.css';
import type { MenuItemProps } from '../fields/ContextMenu';

export const DropdownMenu = ({
  children,
  options = [],
}: {
  children: ReactNode;
  options: MenuItemProps[];
}): ReactElement => {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger>{children}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className="DropdownMenuContent"
          align="end"
        >
          {options.map(({ label, icon, action, disabled }: MenuItemProps) => (
            <DropdownMenuPrimitive.Item
              key={label}
              className="DropdownMenuItem"
              onClick={action}
              disabled={disabled}
            >
              <div className="flex w-full items-center gap-2 typo-callout">
                {icon} {label}
              </div>
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
};
