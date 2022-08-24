import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import usePrivilegedSession from '@dailydotdev/shared/src/hooks/usePrivilegedSession';
import VerifySessionModal from '@dailydotdev/shared/src/components/auth/VerifySessionModal';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import React, {
  FormEvent,
  ReactElement,
  useContext,
  useRef,
  useState,
} from 'react';
import { AccountSecurityDisplay as Display } from '../../components/layouts/AccountLayout/common';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import AccountSecurityDefault from '../../components/layouts/AccountLayout/Security';
import EmailFormPage from '../../components/layouts/AccountLayout/Security/EmailFormPage';
import ChangePasswordForm, {
  ChangePasswordParams,
} from '../../components/layouts/AccountLayout/Security/ChangePasswordForm';

const AccountSecurityPage = (): ReactElement => {
  const { user } = useContext(AuthContext);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [activeDisplay, setActiveDisplay] = useState(Display.Default);
  const { displayToast } = useToastNotification();
  const formRef = useRef<HTMLFormElement>();
  const onPasswordReset = () => {
    displayToast('Password reset successful!');
    setActiveDisplay(Display.Default);
  };

  const {
    showVerifySession,
    onUpdatePassword,
    onPasswordLogin,
    onCloseVerifySession,
    onSocialLogin,
  } = usePrivilegedSession({
    onResetSuccessful: onPasswordReset,
    onSessionVerified: () => {
      const form = formToJson<ChangePasswordParams>(formRef.current);
      onUpdatePassword(form);
    },
  });

  if (!user) {
    return null;
  }

  const onChangeEmail = () => {
    setIsEmailSent(true);
    setActiveDisplay(Display.Default);
  };

  const onConnectEmail = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formToJson<ChangePasswordParams>(e.currentTarget);
    onUpdatePassword(form);
    // setIsEmailSent(true);
    // setActiveDisplay(Display.Default);
  };

  return (
    <TabContainer showHeader={false} controlledActive={activeDisplay}>
      <Tab label={Display.Default}>
        <AccountSecurityDefault
          isEmailSent={isEmailSent}
          onSwitchDisplay={setActiveDisplay}
        />
      </Tab>
      <Tab label={Display.ChangePassword}>
        <ChangePasswordForm
          onActiveDisplay={setActiveDisplay}
          onUpdatePassword={onUpdatePassword}
          formRef={formRef}
        />
        {showVerifySession && (
          <VerifySessionModal
            isOpen={showVerifySession}
            onRequestClose={() => onCloseVerifySession()}
            onPasswordLogin={onPasswordLogin}
            onSocialLogin={onSocialLogin}
          />
        )}
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
