import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import React, { ReactElement, useContext, useState } from 'react';
import { AccountSecurityDisplay as Display } from '../../components/layouts/AccountLayout/common';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import AccountSecurityDefault from '../../components/layouts/AccountLayout/Security';
import EmailFormPage from '../../components/layouts/AccountLayout/Security/EmailFormPage';


const AccountSecurityPage = (): ReactElement => {
  const { user } = useContext(AuthContext);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [activeDisplay, setActiveDisplay] = useState(Display.Default);

  if (!user) {
    return null;
  }

  const onChangeEmail = () => {
    setIsEmailSent(true);
    setActiveDisplay(Display.Default);
  };

  const onConnectEmail = () => {
    setIsEmailSent(true);
    setActiveDisplay(Display.Default);
  };

  return (
    <TabContainer showHeader={false} controlledActive={activeDisplay}>
      <Tab label={Display.Default}>
        <AccountSecurityDefault
          isEmailSent={isEmailSent}
          onSwitchDisplay={setActiveDisplay}
        />
      </Tab>
      <Tab label={Display.ChangeEmail}>
        <EmailFormPage
          title="Change email"
          onSubmit={onChangeEmail}
          onSwitchDisplay={setActiveDisplay}
        />
      </Tab>
      <Tab label={Display.ConnectEmail}>
        <EmailFormPage
          title="Connect email"
          onSubmit={onConnectEmail}
          onSwitchDisplay={setActiveDisplay}
        />
      </Tab>
    </TabContainer>
  );
};

AccountSecurityPage.getLayout = getAccountLayout;

export default AccountSecurityPage;
