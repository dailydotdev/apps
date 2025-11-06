import { Controller, useFormContext } from 'react-hook-form';
import React from 'react';
import { ArrowIcon } from '../icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import type { ButtonProps, IconType } from '../buttons/Button';
import { Button, ButtonVariant } from '../buttons/Button';
import type { MenuItemProps } from '../dropdown/common';

type SelectProps = {
  name: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  icon?: IconType;
  buttonProps?: ButtonProps<'button'>;
  onSelect?: (value: string) => void;
};

const Select = ({
  name,
  options,
  placeholder,
  icon,
  buttonProps,
  onSelect,
}: SelectProps) => {
  const { control, setValue } = useFormContext();

  const menuItems: MenuItemProps[] = options.map((opt) => {
    return {
      label: opt.label,
      action: () => {
        setValue(name, opt.value);
        onSelect?.(opt.value);
      },
    };
  });

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <>
          <input type="hidden" {...field} />
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full" asChild>
              <Button
                icon={icon}
                variant={ButtonVariant.Float}
                {...buttonProps}
              >
                {options.find((opt) => opt.value === field.value)?.label ||
                  placeholder}
                <ArrowIcon className="ml-auto rotate-180" secondary />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={10}
              className="flex w-[var(--radix-popper-anchor-width)] flex-col gap-1 overflow-y-auto overflow-x-hidden !p-0"
            >
              <DropdownMenuOptions options={menuItems} />
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    />
  );
};

export default Select;
