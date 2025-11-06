import React from 'react';
import Select from '../fields/Select';
import { ButtonSize } from '../buttons/Button';
import type { IconType } from '../buttons/Button';

export const MONTHS = [
  { label: 'January', value: '1' },
  { label: 'February', value: '2' },
  { label: 'March', value: '3' },
  { label: 'April', value: '4' },
  { label: 'May', value: '5' },
  { label: 'June', value: '6' },
  { label: 'July', value: '7' },
  { label: 'August', value: '8' },
  { label: 'September', value: '9' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
];

type MonthSelectProps = {
  name: string;
  icon?: IconType;
  placeholder?: string;
};

const MonthSelect = ({ name, icon, placeholder }: MonthSelectProps) => {
  return (
    <Select
      icon={icon}
      options={MONTHS}
      name={name}
      placeholder={placeholder}
      buttonProps={{
        size: ButtonSize.Large,
      }}
    />
  );
};

export default MonthSelect;
