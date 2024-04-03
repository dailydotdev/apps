import React, { ReactElement } from 'react';
import { ButtonSize } from '../buttons/common';
import { Dropdown } from '../fields/Dropdown';
import { getTimeZoneIcon, getTimeZoneOptions } from '../../lib/timezones';
import useProfileForm from '../../hooks/useProfileForm';

const timeZoneOptions = getTimeZoneOptions();
const timeZoneValues = timeZoneOptions.map((timeZone) => timeZone.label);

interface TimezoneDropdownProps {
  userTimeZone: string;
  setUserTimeZone: (timezone: string) => void;
}
const TimezoneDropdown = ({
  userTimeZone,
  setUserTimeZone,
}: TimezoneDropdownProps): ReactElement => {
  const { updateUserProfile } = useProfileForm();

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
      drawerProps={{
        displayCloseButton: true,
        className: { close: 'pb-4' },
      }}
    />
  );
};
export { TimezoneDropdown };
