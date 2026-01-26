import React from 'react';
import { ArrowIcon } from '../icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import type { IconType } from '../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import type { MenuItemProps } from '../dropdown/common';

export const MONTHS = [
  { label: 'January', value: '0' },
  { label: 'February', value: '1' },
  { label: 'March', value: '2' },
  { label: 'April', value: '3' },
  { label: 'May', value: '4' },
  { label: 'June', value: '5' },
  { label: 'July', value: '6' },
  { label: 'August', value: '7' },
  { label: 'September', value: '8' },
  { label: 'October', value: '9' },
  { label: 'November', value: '10' },
  { label: 'December', value: '11' },
];

type MonthSelectProps = {
  name?: string;
  icon?: IconType;
  placeholder?: string;
  value?: string;
  onSelect?: (value: string) => void;
  disabled?: boolean;
};

const MonthSelect = ({
  icon,
  placeholder,
  value,
  onSelect,
  disabled,
}: MonthSelectProps) => {
  const menuItems: MenuItemProps[] = MONTHS.map((opt) => ({
    label: opt.label,
    action: () => onSelect?.(opt.value),
  }));

  const selectedLabel = MONTHS.find((opt) => opt.value === value)?.label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full" asChild disabled={disabled}>
        <Button
          icon={icon}
          variant={ButtonVariant.Float}
          size={ButtonSize.Large}
          disabled={disabled}
        >
          {selectedLabel || placeholder}
          <ArrowIcon className="ml-auto rotate-180" secondary />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={10}
        className="flex w-[var(--radix-popper-anchor-width)] flex-col gap-1 !p-0"
      >
        <DropdownMenuOptions options={menuItems} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MonthSelect;
