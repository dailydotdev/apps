import { Dropdown } from '@dailydotdev/shared/src/components/fields/Dropdown';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  getTimeZoneOptions,
  getUserInitialTimezone,
  getTimeZoneIcon,
} from '@dailydotdev/shared/src/lib/timezones';
import React, { ReactElement, useContext, useState } from 'react';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import { AccountPageContainer } from '../../components/layouts/AccountLayout/AccountPageContainer';
import {
  AccountContentHeading,
  ContentHeading,
  ContentText,
} from '../../components/layouts/AccountLayout/common';

const timeZoneOptions = getTimeZoneOptions();
const timeZoneValues = timeZoneOptions.map((timeZone) => timeZone.label);

const AccountOthersPage = (): ReactElement => {
  const { user } = useContext(AuthContext);
  const [userTimeZone, setUserTimeZone] = useState<string>(
    getUserInitialTimezone({
      userTimezone: user?.timezone,
      update: true,
    }),
  );

  const timezoneUpdated = (timezone: string) => {
    const findTimeZoneRow = timeZoneOptions.find((_timeZone) => {
      return _timeZone.label === timezone;
    });
    setUserTimeZone(findTimeZoneRow.value);
  };

  const Icon = getTimeZoneIcon(userTimeZone);

  return (
    <AccountPageContainer title="Other Settings">
      <ContentHeading>Timezone</ContentHeading>
      <ContentText className="mt-1">
        Used to calculate your weekly goal cycle and other time-based
        activities.
      </ContentText>
      <Dropdown
        icon={<Icon />}
        buttonSize="select"
        className="mt-6 w-70"
        selectedIndex={timeZoneOptions.findIndex(
          (timeZone) => timeZone.value === userTimeZone,
        )}
        onChange={timezoneUpdated}
        options={timeZoneValues}
        scrollable
        menuClassName="menu-secondary"
      />
      <AccountContentHeading>Newsletter</AccountContentHeading>
      <Switch
        inputId="newsletter-switch"
        name="newsletter"
        className="mt-6"
        compact={false}
      >
        Subscribe to the Community Newsletter
      </Switch>
    </AccountPageContainer>
  );
};

AccountOthersPage.getLayout = getAccountLayout;

export default AccountOthersPage;
