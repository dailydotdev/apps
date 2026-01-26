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

const generateYearOptions = (): { label: string; value: string }[] => {
  const currentYear = new Date().getFullYear();
  const years: { label: string; value: string }[] = [];

  for (let i = 0; i < 100; i += 1) {
    const year = currentYear - i;
    years.push({ label: year.toString(), value: year.toString() });
  }

  return years;
};

export const YEAR_OPTIONS = generateYearOptions();

type YearSelectProps = {
  name?: string;
  icon?: IconType;
  placeholder?: string;
  value?: string;
  onSelect?: (value: string) => void;
  disabled?: boolean;
};

const YearSelect = ({
  icon,
  placeholder,
  value,
  onSelect,
  disabled,
}: YearSelectProps) => {
  const menuItems: MenuItemProps[] = YEAR_OPTIONS.map((opt) => ({
    label: opt.label,
    action: () => onSelect?.(opt.value),
  }));

  const selectedLabel = YEAR_OPTIONS.find((opt) => opt.value === value)?.label;

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

export default YearSelect;
