import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import usePrivilegedSession from '@dailydotdev/shared/src/hooks/usePrivilegedSession';
import VerifySessionModal from '@dailydotdev/shared/src/components/auth/VerifySessionModal';
import React, { ReactElement, useRef, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import {
  AuthFlow,
  initializeKratosFlow,
  submitKratosFlow,
} from '@dailydotdev/shared/src/lib/kratos';
import {
  getNodeValue,
  ValidateChangeEmail,
  ValidateResetPassword,
} from '@dailydotdev/shared/src/lib/auth';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { AccountSecurityDisplay as Display } from '../../components/layouts/AccountLayout/common';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import AccountSecurityDefault, {
  ChangePasswordParams,
} from '../../components/layouts/AccountLayout/Security';
import EmailFormPage from '../../components/layouts/AccountLayout/Security/EmailFormPage';

const AccountSecurityPage = (): ReactElement => {
  const updatePasswordRef = useRef<HTMLFormElement>();
  const { displayToast } = useToastNotification();
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [activeDisplay, setActiveDisplay] = useState(Display.Default);
  const { data: settings } = useQuery(['settings'], () =>
    initializeKratosFlow(AuthFlow.Settings),
  );

  const onSetPassword = () => {
    displayToast('Password reset successful!');
    updatePasswordRef.current.reset();
  };

  const {
    showVerifySession,
    initializePrivilegedSession,
    onPasswordLogin,
    onCloseVerifySession,
    onSocialLogin,
  } = usePrivilegedSession();

  const { mutateAsync: resetPassword } = useMutation(
    (params: ValidateResetPassword) => submitKratosFlow(params),
    {
      onSuccess: ({ redirect, error, code }) => {
        if (redirect && code === 403) {
          return initializePrivilegedSession(redirect);
        }

        if (error) {
          return null;
        }

        return onSetPassword();
      },
    },
  );

  const onUpdatePassword = ({ password }: ChangePasswordParams) => {
    const { action, nodes } = settings.ui;
    const csrfToken = getNodeValue('csrf_token', nodes);
    resetPassword({
      action,
      params: { csrf_token: csrfToken, method: 'password', password },
    });
  };

  const { mutateAsync: changeEmail } = useMutation(
    (params: ValidateChangeEmail) => submitKratosFlow(params),
    {
      onSuccess: ({ redirect, error, code }) => {
        if (redirect && code === 403) {
          return initializePrivilegedSession(redirect);
        }

        if (error) {
          return null;
        }

        setIsEmailSent(true);
        setActiveDisplay(Display.Default);
        return null;
      },
    },
  );

  const onChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const input = Array.from(form.elements).find(
      (el) => el.getAttribute('name') === 'traits.email',
    ) as HTMLInputElement;
    const email = input?.value?.trim();

    if (!email) {
      return;
    }

    const { action, nodes } = settings.ui;
    const csrfToken = getNodeValue('csrf_token', nodes);
    changeEmail({
      action,
      params: {
        csrf_token: csrfToken,
        method: 'profile',
        'traits.email': email,
        'traits.name': getNodeValue('traits.name', nodes),
        'traits.username': getNodeValue('traits.username', nodes),
        'traits.image': getNodeValue('traits.image', nodes),
      },
    });
    return;
  };

  return (
    <>
      <TabContainer showHeader={false} controlledActive={activeDisplay}>
        <Tab label={Display.Default}>
          <AccountSecurityDefault
            isEmailSent={isEmailSent}
            updatePasswordRef={updatePasswordRef}
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
