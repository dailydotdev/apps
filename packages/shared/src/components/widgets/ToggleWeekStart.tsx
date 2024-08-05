import React, { ReactElement } from 'react';
import { DayOfWeek, getDefaultStartOfWeek } from '../../lib/date';
import { Radio, ClassName as RadioClassName } from '../fields/Radio';
import { useReadingStreak } from '../../hooks/streaks';

export const ToggleWeekStart = ({
  className,
}: {
  className?: RadioClassName;
}): ReactElement => {
  const { streak, isLoading, updateStreakConfig } = useReadingStreak();

  const toggleWeekStart = (weekStart: string) => {
    updateStreakConfig({ weekStart: parseInt(weekStart, 10) });
  };

  if (isLoading) {
    return null;
  }

  return (
    <Radio
      name="freeze-days"
      value={getDefaultStartOfWeek(streak.weekStart)}
      options={[
        {
          label: 'Friday to Saturday',
          value: DayOfWeek.Monday.toString(),
        },
        {
          label: 'Saturday to Sunday',
          value: DayOfWeek.Sunday.toString(),
        },
      ]}
      onChange={toggleWeekStart}
      className={className}
    />
  );
};
