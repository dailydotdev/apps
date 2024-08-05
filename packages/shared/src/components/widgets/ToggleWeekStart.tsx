import React, { ReactElement } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { DayOfWeek, getDefaultStartOfWeek } from '../../lib/date';
import { Radio, ClassName as RadioClassName } from '../fields/Radio';
import useProfileForm from '../../hooks/useProfileForm';
import { useReadingStreak } from '../../hooks/streaks';

export const ToggleWeekStart = ({
  className,
}: {
  className?: RadioClassName;
}): ReactElement => {
  const { user } = useAuthContext();
  const { updateUserProfile } = useProfileForm();
  const { streak, isLoading } = useReadingStreak();

  const toggleWeekStart = (value: string) => {
    updateUserProfile({ weekStart: parseInt(value, 10) });
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
