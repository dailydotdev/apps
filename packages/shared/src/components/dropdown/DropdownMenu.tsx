import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import './style.css';
import {
  DropdownMenu as DropdownMenuRoot,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import type { MenuItemProps } from '../fields/ContextMenu';

export const DropdownMenu = ({
  children,
  options = [],
}: {
  children: ReactNode;
  options: MenuItemProps[];
}): ReactElement => {
  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent className="DropdownMenuContent" align="end">
          {options.map(({ label, icon, action, disabled }: MenuItemProps) => (
            <DropdownMenuItem
              key={label}
              className="DropdownMenuItem"
              onClick={action}
              disabled={disabled}
            >
              <div className="flex w-full items-center gap-2 typo-callout">
                {icon} {label}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};
