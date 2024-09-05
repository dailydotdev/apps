import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import React, { ReactElement, useState } from 'react';

import { getAccountLayout } from '../../components/layouts/AccountLayout';
import { AccountSecurityDisplay as Display } from '../../components/layouts/AccountLayout/common';
import ProfileIndex from '../../components/layouts/AccountLayout/Profile';
import VerifyWorkEmail from '../../components/layouts/AccountLayout/Profile/VerifyWorkEmail';

const AccountProfilePage = (): ReactElement => {
  const [activeDisplay, setActiveDisplay] = useState(Display.Default);
  const [workEmail, setWorkEmail] = useState('');

  return (
    <TabContainer showHeader={false} controlledActive={activeDisplay}>
      <Tab label={Display.Default}>
        <ProfileIndex
          onSwitchDisplay={setActiveDisplay}
          workEmail={workEmail}
          setWorkEmail={setWorkEmail}
        />
      </Tab>
      <Tab label={Display.ChangeEmail}>
        <VerifyWorkEmail
          onSwitchDisplay={setActiveDisplay}
          workEmail={workEmail}
        />
      </Tab>
    </TabContainer>
  );
};

AccountProfilePage.getLayout = getAccountLayout;

export default AccountProfilePage;
