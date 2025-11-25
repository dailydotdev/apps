import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Select from '../fields/Select';
import { ButtonSize } from '../buttons/Button';
import type { IconType } from '../buttons/Button';

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
