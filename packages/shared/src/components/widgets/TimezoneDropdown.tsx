import classNames from 'classnames';
import React, { ReactElement } from 'react';

import useProfileForm from '../../hooks/useProfileForm';
import { getTimeZoneIcon, getTimeZoneOptions } from '../../lib/timezones';
import { ButtonSize } from '../buttons/common';
import { Dropdown } from '../fields/Dropdown';

const timeZoneOptions = getTimeZoneOptions();
const timeZoneValues = timeZoneOptions.map((timeZone) => timeZone.label);

interface TimezoneDropdownProps {
  userTimeZone: string;
  setUserTimeZone: (timezone: string) => void;
  className?: {
    container?: string;
    menu?: string;
  };
}
const TimezoneDropdown = ({
  userTimeZone,
  setUserTimeZone,
  className,
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
      className={{
        container: classNames('mt-6 w-70', className?.container),
        menu: classNames('menu-secondary', className?.menu),
      }}
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
