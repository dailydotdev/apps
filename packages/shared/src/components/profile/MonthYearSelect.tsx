import React from 'react';
import MonthSelect from './MonthSelect';
import YearSelect from './YearSelect';

type MonthYearSelectProps = {
  monthName: string;
  yearName: string;
  monthPlaceholder?: string;
  yearPlaceholder?: string;
};

const MonthYearSelect = ({
  monthName,
  yearName,
  monthPlaceholder = 'Month',
  yearPlaceholder = 'Year',
}: MonthYearSelectProps) => {
  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <MonthSelect name={monthName} placeholder={monthPlaceholder} />
      </div>
      <div className="flex-1">
        <YearSelect name={yearName} placeholder={yearPlaceholder} />
      </div>
    </div>
  );
};

export default MonthYearSelect;
