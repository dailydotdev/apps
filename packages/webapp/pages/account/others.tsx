import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import useProfileForm from '@dailydotdev/shared/src/hooks/useProfileForm';
import React, { ReactElement, useContext } from 'react';
import { Timezone } from '@dailydotdev/shared/src/components/widgets/Timezone';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import { AccountPageContainer } from '../../components/layouts/AccountLayout/AccountPageContainer';
import AccountContentSection from '../../components/layouts/AccountLayout/AccountContentSection';

const AccountOthersPage = (): ReactElement => {
  const { user } = useContext(AuthContext);
  const { updateUserProfile } = useProfileForm();

  return (
    <AccountPageContainer title="Other settings">
      <AccountContentSection
        className={{ heading: 'mt-0' }}
        title="Timezone"
        description="Used to calculate your weekly goal cycle and other time-based
        activities."
      >
        <Timezone />
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
