import React from 'react';
import Select from '../fields/Select';
import { ButtonSize } from '../buttons/Button';
import type { IconType } from '../buttons/Button';

const generateYearOptions = (): { label: string; value: string }[] => {
  const currentYear = new Date().getFullYear();
  const years: { label: string; value: string }[] = [];

  for (let i = 0; i < 100; i++) {
    const year = currentYear - i;
    years.push({ label: year.toString(), value: year.toString() });
  }

  return years;
};

export const YEAR_OPTIONS = generateYearOptions();

type YearSelectProps = {
  name: string;
  icon?: IconType;
  placeholder?: string;
};

const YearSelect = ({ name, icon, placeholder }: YearSelectProps) => {
  return (
    <Select
      icon={icon}
      options={YEAR_OPTIONS}
      name={name}
      placeholder={placeholder}
      buttonProps={{
        size: ButtonSize.Large,
      }}
    />
  );
};

export default YearSelect;
