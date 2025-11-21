import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Select from '../fields/Select';
import { ButtonSize } from '../buttons/Button';
import type { IconType } from '../buttons/Button';

export const MONTHS = [
  { label: 'January', value: 'January' },
  { label: 'February', value: 'February' },
  { label: 'March', value: 'March' },
  { label: 'April', value: 'April' },
  { label: 'May', value: 'May' },
  { label: 'June', value: 'June' },
  { label: 'July', value: 'July' },
  { label: 'August', value: 'August' },
  { label: 'September', value: 'September' },
  { label: 'October', value: 'October' },
  { label: 'November', value: 'November' },
  { label: 'December', value: 'December' },
];

type MonthSelectProps = {
  name: string;
  icon?: IconType;
  placeholder?: string;
  onSelect?: (value: string) => void;
};

const MonthSelect = ({
  name,
  icon,
  placeholder,
  onSelect,
}: MonthSelectProps) => {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ fieldState }) => (
        <div className="flex flex-col gap-1">
          <Select
            icon={icon}
            options={MONTHS}
            name={name}
            placeholder={placeholder}
            buttonProps={{
              size: ButtonSize.Large,
            }}
            onSelect={(value) => onSelect(value)}
          />
          {fieldState.error && (
            <p className="text-sm text-status-error">
              {fieldState.error?.message}
            </p>
          )}
        </div>
      )}
    />
  );
};

export default MonthSelect;
