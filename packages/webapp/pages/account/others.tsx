import { Dropdown } from '@dailydotdev/shared/src/components/fields/Dropdown';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  getTimeZoneOptions,
  getUserInitialTimezone,
  getTimeZoneIcon,
} from '@dailydotdev/shared/src/lib/timezones';
import useProfileForm from '@dailydotdev/shared/src/hooks/useProfileForm';
import React, { ReactElement, useContext, useState } from 'react';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import { AccountPageContainer } from '../../components/layouts/AccountLayout/AccountPageContainer';
import AccountContentSection from '../../components/layouts/AccountLayout/AccountContentSection';

const timeZoneOptions = getTimeZoneOptions();
const timeZoneValues = timeZoneOptions.map((timeZone) => timeZone.label);

const AccountOthersPage = (): ReactElement => {
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
    <AccountPageContainer title="Other Settings">
      <AccountContentSection
        className={{ heading: 'mt-0' }}
        title="Timezone"
        description="Used to calculate your weekly goal cycle and other time-based
        activities."
      >
        <Dropdown
          icon={<Icon />}
          buttonSize="large"
          className={{ container: 'mt-6 w-70', menu: 'menu-secondary' }}
          selectedIndex={timeZoneOptions.findIndex(
            (timeZone) => timeZone.value === userTimeZone,
          )}
          onChange={timezoneUpdated}
          options={timeZoneValues}
          scrollable
          data-testid="timezone_dropdown"
        />
      </AccountContentSection>
      <AccountContentSection title="Newsletter">
        <Switch
          data-testid="newsletter_switch"
          inputId="newsletter-switch"
          name="newsletter"
          className="mt-6"
          compact={false}
          checked={user.acceptedMarketing}
          onToggle={() =>
            updateUserProfile({ acceptedMarketing: !user.acceptedMarketing })
          }
        >
          Subscribe to the Community Newsletter
        </Switch>
      </AccountContentSection>
    </AccountPageContainer>
  );
};

AccountOthersPage.getLayout = getAccountLayout;

export default AccountOthersPage;
