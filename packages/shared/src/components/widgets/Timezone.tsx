import React, { ReactElement, useContext, useState } from 'react';
import { ButtonSize } from '../buttons/common';
import { Dropdown } from '../fields/Dropdown';
import {
  getTimeZoneIcon,
  getTimeZoneOptions,
  getUserInitialTimezone,
} from '../../lib/timezones';
import AuthContext from '../../contexts/AuthContext';
import useProfileForm from '../../hooks/useProfileForm';

const timeZoneOptions = getTimeZoneOptions();
const timeZoneValues = timeZoneOptions.map((timeZone) => timeZone.label);

const Timezone = (): ReactElement => {
  const { user } = useContext(AuthContext);
  const { updateUserProfile } = useProfileForm();

  const [userTimeZone, setUserTimeZone] = useState<string>(
    getUserInitialTimezone({
      userTimezone: user?.timezone,
      update: true,
    }),
  );

  const timezoneUpdated = async (timezone: string) => {
    const findTimeZoneRow = timeZoneOptions.find((_timeZone) => {
      return _timeZone.label === timezone;
    });
    setUserTimeZone(findTimeZoneRow.value);
    await updateUserProfile({ timezone: findTimeZoneRow.value });
  };

  const Icon = getTimeZoneIcon(userTimeZone);
  return (
    <Dropdown
      icon={<Icon />}
      buttonSize={ButtonSize.Large}
      className={{ container: 'mt-6 w-70', menu: 'menu-secondary' }}
      selectedIndex={timeZoneOptions.findIndex(
        (timeZone) => timeZone.value === userTimeZone,
      )}
      onChange={timezoneUpdated}
      options={timeZoneValues}
      scrollable
      data-testid="timezone_dropdown"
    />
  );
};
export { Timezone };
