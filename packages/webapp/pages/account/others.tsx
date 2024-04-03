import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import useProfileForm from '@dailydotdev/shared/src/hooks/useProfileForm';
import React, { ReactElement, useContext, useState } from 'react';
import { TimezoneDropdown } from '@dailydotdev/shared/src/components/widgets/TimezoneDropdown';
import { getUserInitialTimezone } from '@dailydotdev/shared/src/lib/timezones';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import { AccountPageContainer } from '../../components/layouts/AccountLayout/AccountPageContainer';
import AccountContentSection from '../../components/layouts/AccountLayout/AccountContentSection';

const AccountOthersPage = (): ReactElement => {
  const { user } = useContext(AuthContext);
  const [userTimeZone, setUserTimeZone] = useState<string>(
    getUserInitialTimezone({
      userTimezone: user?.timezone,
      update: true,
    }),
  );
  const { updateUserProfile } = useProfileForm();

  return (
    <AccountPageContainer title="Other settings">
      <AccountContentSection
        className={{ heading: 'mt-0' }}
        title="TimezoneDropdown"
        description="Used to calculate your weekly goal cycle and other time-based
        activities."
      >
        <TimezoneDropdown
          userTimeZone={userTimeZone}
          setUserTimeZone={setUserTimeZone}
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
