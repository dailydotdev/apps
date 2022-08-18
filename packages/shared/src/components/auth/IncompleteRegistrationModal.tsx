import React, { ReactElement, useState } from 'react';
import {
  getHourTimezone,
  getTimeZoneOptions,
  getUserInitialTimezone,
} from '../../lib/timezones';
import { Dropdown } from '../fields/Dropdown';
import { ModalCloseButton } from '../modals/ModalCloseButton';
import { ModalProps, StyledModal } from '../modals/StyledModal';
import DaytimeIcon from '../../../icons/timezone_daytime.svg';
import NighttimeIcon from '../../../icons/timezone_nighttime.svg';
import { Button } from '../buttons/Button';
import { LoggedUser } from '../../lib/user';

const timeZoneOptions = getTimeZoneOptions();
const timeZoneValues = timeZoneOptions.map((timeZone) => timeZone.label);

interface IncompleteRegistrationModalProps extends ModalProps {
  user: LoggedUser;
  updateUser: (user: Partial<LoggedUser>) => Promise<void>;
}

function IncompleteRegistrationModal({
  user,
  updateUser,
  onRequestClose,
  ...props
}: IncompleteRegistrationModalProps): ReactElement {
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [userTimeZone, setUserTimeZone] = useState<string>(
    getUserInitialTimezone({ userTimezone: 'utc' }),
  );
  const timezoneUpdated = (timeZone: string) => {
    const findTimeZoneRow = timeZoneOptions.find(
      ({ label }) => label === timeZone,
    );
    setUserTimeZone(findTimeZoneRow.value);
  };

  const hour = getHourTimezone(userTimeZone);
  const Background = hour >= 6 && hour < 18 ? DaytimeIcon : NighttimeIcon;

  const onComplete = async (e) => {
    setSubmitDisabled(true);
    await updateUser({ timezone: userTimeZone });
    setSubmitDisabled(false);
    onRequestClose(e);
  };

  return (
    <StyledModal {...props} contentClassName="flex flex-col">
      <header className="flex relative justify-between items-center p-3 w-full border-b border-theme-divider-tertiary">
        <span className="font-bold typo-body">Set your timezone</span>
        <ModalCloseButton />
      </header>
      <div className="flex flex-col items-center py-8">
        <p className="px-9 typo-body text-theme-label-secondary">
          Used to calculate your weekly {`goal's`} cycle and other time-based
          activities.
        </p>
        <Dropdown
          className="mt-12 w-80"
          selectedIndex={timeZoneOptions.findIndex(
            (timeZone) => timeZone.value === userTimeZone,
          )}
          onChange={timezoneUpdated}
          options={timeZoneValues}
          scrollable
          menuClassName="menu-secondary"
        />
        <Background className="mt-7 w-full h-72" />
        <Button
          className="btn-primary bg-theme-color-cabbage"
          onClick={onComplete}
          disabled={submitDisabled}
        >
          Complete Registration
        </Button>
      </div>
    </StyledModal>
  );
}

export default IncompleteRegistrationModal;
