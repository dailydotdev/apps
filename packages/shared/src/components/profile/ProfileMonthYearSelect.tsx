import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import MonthSelect from './MonthSelect';
import YearSelect from './YearSelect';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

type MonthYearSelectProps = {
  name: string;
  monthPlaceholder?: string;
  yearPlaceholder?: string;
};

const ProfileMonthYearSelect = ({
  name,
  monthPlaceholder = 'Month',
  yearPlaceholder = 'Year',
}: MonthYearSelectProps) => {
  const yearName = `${name}Year`;
  const monthName = `${name}Month`;
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const month = watch(monthName);
  const year = watch(yearName);
  const current = watch('current');

  const handleSelect = (value: string, inputName: string) => {
    setValue(inputName, value);
  };

  useEffect(() => {
    if (year) {
      const monthToUse = month || 0;
      const date = new Date(Date.UTC(year, monthToUse, 1, 12, 0, 0, 0));
      setValue(name, date);
    }
  }, [month, year, name, setValue]);

  useEffect(() => {
    if (current) {
      setValue('endedAt', null);
      setValue('endedAtMonth', '');
      setValue('endedAtYear', '');
    }
  }, [current, setValue]);

  return (
    <div>
      <div className="flex gap-6">
        <div className="flex-1">
          <MonthSelect
            name={monthName}
            placeholder={monthPlaceholder}
            onSelect={(value) => handleSelect(value, monthName)}
          />
        </div>
        <div className="flex-1">
          <YearSelect
            name={yearName}
            placeholder={yearPlaceholder}
            onSelect={(value) => handleSelect(value, yearName)}
          />
        </div>
      </div>
      {errors[name] && (
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.StatusError}
        >
          {errors[name]?.message as string}
        </Typography>
      )}
    </div>
  );
};

export default ProfileMonthYearSelect;
