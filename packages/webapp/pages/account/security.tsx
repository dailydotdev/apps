import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import usePrivilegedSession from '@dailydotdev/shared/src/hooks/usePrivilegedSession';
import VerifySessionModal from '@dailydotdev/shared/src/components/auth/VerifySessionModal';
import React, { ReactElement, useRef, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import {
  AuthFlow,
  getKratosProviders,
  initializeKratosFlow,
  KRATOS_ERROR,
  submitKratosFlow,
} from '@dailydotdev/shared/src/lib/kratos';
import {
  getNodeValue,
  SettingsParams,
  ValidateChangeEmail,
  ValidateResetPassword,
} from '@dailydotdev/shared/src/lib/auth';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { AccountSecurityDisplay as Display } from '../../components/layouts/AccountLayout/common';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import AccountSecurityDefault, {
  ChangePasswordParams,
  UpdateProvidersParams,
} from '../../components/layouts/AccountLayout/Security';
import EmailFormPage from '../../components/layouts/AccountLayout/Security/EmailFormPage';

const AccountSecurityPage = (): ReactElement => {
  const updatePasswordRef = useRef<HTMLFormElement>();
  const { displayToast } = useToastNotification();
  const [activeDisplay, setActiveDisplay] = useState(Display.Default);
  const [hint, setHint] = useState<string>(null);
  const { data: userProviders, refetch: refetchProviders } = useQuery(
    'providers',
    () => getKratosProviders(),
  );
  const { data: settings } = useQuery(['settings'], () =>
    initializeKratosFlow(AuthFlow.Settings),
  );

  const onSetPassword = () => {
    displayToast('Password changed successfully!');
    updatePasswordRef.current.reset();
  };

  const {
    session,
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
    (params: ValidateChangeEmail) => {
      setHint(null);
      return submitKratosFlow(params);
    },
    {
      onSuccess: ({ redirect, error, code }) => {
        if (redirect && code === 403) {
          return initializePrivilegedSession(redirect);
        }

        if (error) {
          if (error?.ui?.messages[0]?.id === KRATOS_ERROR.EXISTING_USER) {
            setHint('This email address is already in use');
          }

          return null;
        }

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
        'traits.userId': getNodeValue('traits.userId', nodes),
      },
    });
  };

  const { mutateAsync: updateSettings } = useMutation(
    (params: SettingsParams) => submitKratosFlow(params),
    {
      onSuccess: ({ redirect, error, code }) => {
        if (redirect) {
          if (code === 403) {
            initializePrivilegedSession(redirect);
            return;
          }

          window.open(redirect);
          return;
        }

        if (error) {
          return;
        }

        refetchProviders();
      },
    },
  );

  const updateSocialProviders = (postData: UpdateProvidersParams) => {
    const { action, nodes } = settings.ui;
    const csrfToken = getNodeValue('csrf_token', nodes);
    const params = { ...postData, csrf_token: csrfToken };
    updateSettings({ action, params });
  };

  return (
    <>
      <TabContainer showHeader={false} controlledActive={activeDisplay}>
        <Tab label={Display.Default}>
          <AccountSecurityDefault
            session={session}
            userProviders={userProviders}
            updatePasswordRef={updatePasswordRef}
            onSwitchDisplay={setActiveDisplay}
            onUpdatePassword={onUpdatePassword}
            onUpdateProviders={updateSocialProviders}
          />
        </Tab>
        <Tab label={Display.ChangeEmail}>
          <EmailFormPage
            title="Change email"
            onSubmit={onChangeEmail}
            onSwitchDisplay={setActiveDisplay}
            hint={hint}
            setHint={setHint}
          />
        </Tab>
      </TabContainer>
      {showVerifySession && (
        <VerifySessionModal
          isOpen={showVerifySession}
          userProviders={userProviders}
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
