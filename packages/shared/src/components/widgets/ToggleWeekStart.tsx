import React, { ReactElement } from 'react';
import { DayOfWeek, getDefaultStartOfWeek } from '../../lib/date';
import { Radio, ClassName as RadioClassName } from '../fields/Radio';
import { useReadingStreak } from '../../hooks/streaks';

export const ToggleWeekStart = ({
  className,
}: {
  className?: RadioClassName;
}): ReactElement => {
  const { streak, isLoading, updateStreakConfig, isUpdatingConfig } =
    useReadingStreak();

  const toggleWeekStart = (weekStart: string) => {
    updateStreakConfig({ weekStart: parseInt(weekStart, 10) });
  };

  if (isLoading) {
    return null;
  }

  return (
    <Radio
      aria-busy={isUpdatingConfig}
      className={className}
      disabled={isUpdatingConfig}
      name="freeze-days"
      onChange={toggleWeekStart}
      value={getDefaultStartOfWeek(streak.weekStart)}
      options={[
        {
          label: 'Friday to Saturday',
          value: DayOfWeek.Sunday.toString(),
        },
        {
          label: 'Saturday to Sunday',
          value: DayOfWeek.Monday.toString(),
        },
      ]}
    />
  );
};
