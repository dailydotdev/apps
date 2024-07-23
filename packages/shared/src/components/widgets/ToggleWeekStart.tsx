import React, { ReactElement } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { isNullOrUndefined } from '../../lib/func';
import { DayOfWeek } from '../../lib/constants';
import { Radio } from '../fields/Radio';
import useProfileForm from '../../hooks/useProfileForm';

const getDefaultStartOfWeek = (weekStart?: number): string => {
  if (isNullOrUndefined(weekStart)) {
    return DayOfWeek.Monday.toString();
  }

  return (weekStart as number).toString();
};

export const ToggleWeekStart = (): ReactElement => {
  const { user } = useAuthContext();
  const { updateUserProfile } = useProfileForm();

  const toggleWeekStart = (value: string) => {
    updateUserProfile({ weekStart: parseInt(value, 10) });
  };

  return (
    <Radio
      name="freeze-days"
      value={getDefaultStartOfWeek(user?.weekStart)}
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
    />
  );
};
