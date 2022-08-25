import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import usePrivilegedSession from '@dailydotdev/shared/src/hooks/usePrivilegedSession';
import VerifySessionModal from '@dailydotdev/shared/src/components/auth/VerifySessionModal';
import React, { FormEvent, ReactElement, useContext, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import {
  AuthFlow,
  initializeKratosFlow,
  submitKratosFlow,
} from '@dailydotdev/shared/src/lib/kratos';
import {
  getNodeValue,
  ValidateResetPassword,
} from '@dailydotdev/shared/src/lib/auth';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { AccountSecurityDisplay as Display } from '../../components/layouts/AccountLayout/common';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import AccountSecurityDefault, {
  ChangePasswordParams,
} from '../../components/layouts/AccountLayout/Security';
import EmailFormPage from '../../components/layouts/AccountLayout/Security/EmailFormPage';

const AccountSecurityPage = (): ReactElement => {
  const { user } = useContext(AuthContext);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [activeDisplay, setActiveDisplay] = useState(Display.Default);
  const { data: settings } = useQuery(['settings'], () =>
    initializeKratosFlow(AuthFlow.Settings),
  );

  const {
    showVerifySession,
    initializePrivilegedSession,
    onPasswordLogin,
    onCloseVerifySession,
    onSocialLogin,
  } = usePrivilegedSession();

  const { mutateAsync: resetPassword } = useMutation(
    ({
      onSuccess,
      ...params
    }: ValidateResetPassword & { onSuccess: () => void }) =>
      submitKratosFlow(params),
    {
      onSuccess: (res, { onSuccess }) => {
        const { redirect, error, code } = res;
        if (redirect && code === 403) {
          return initializePrivilegedSession(redirect);
        }

        if (error) {
          return null;
        }

        return onSuccess?.();
      },
    },
  );

  const onUpdatePassword = ({ onSuccess, password }: ChangePasswordParams) => {
    const { action, nodes } = settings.ui;
    const csrfToken = getNodeValue('csrf_token', nodes);
    resetPassword({
      action,
      onSuccess,
      params: { csrf_token: csrfToken, method: 'password', password },
    });
  };

  const onChangeEmail = () => {
    setIsEmailSent(true);
    setActiveDisplay(Display.Default);
  };

  const onConnectEmail = (e: FormEvent<HTMLFormElement>) => {
    const onSuccess = () => {
      setIsEmailSent(true);
      setActiveDisplay(Display.Default);
    };
    e.preventDefault();
    const form = formToJson<ChangePasswordParams>(e.currentTarget);
    onUpdatePassword({ ...form, onSuccess });
  };

  return (
    <>
      <TabContainer showHeader={false} controlledActive={activeDisplay}>
        <Tab label={Display.Default}>
          <AccountSecurityDefault
            isEmailSent={isEmailSent}
            onSwitchDisplay={setActiveDisplay}
            onUpdatePassword={onUpdatePassword}
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
            emailProps={{ value: user.email, label: 'Current email' }}
            passwordProps={{ label: 'Password' }}
            title="Connect email"
            onSubmit={onConnectEmail}
            onSwitchDisplay={setActiveDisplay}
          />
        </Tab>
      </TabContainer>
      {showVerifySession && (
        <VerifySessionModal
          isOpen={showVerifySession}
          onRequestClose={() => onCloseVerifySession()}
          onPasswordLogin={onPasswordLogin}
          onSocialLogin={onSocialLogin}
        />
      )}
    </>
  );
};

AccountSecurityPage.getLayout = getAccountLayout;

export default AccountSecurityPage;
