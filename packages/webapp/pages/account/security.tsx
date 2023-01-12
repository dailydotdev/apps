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
    isReady,
    initializePrivilegedSession,
    onPasswordLogin,
    onCloseVerifySession,
    onSocialLogin,
    refetchSession,
  } = usePrivilegedSession();

  const { mutateAsync: resetPassword } = useMutation(
    (params: ValidateResetPassword) => submitKratosFlow(params),
    {
      onSuccess: ({ redirect, error, code }, params) => {
        if (redirect && code === 403) {
          const onVerified = () => resetPassword(params);
          return initializePrivilegedSession(redirect, onVerified);
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
      onSuccess: async ({ redirect, error, code }, params) => {
        if (redirect && code === 403) {
          const onVerified = () => changeEmail(params);
          initializePrivilegedSession(redirect, onVerified);
          return;
        }

        if (error) {
          if (error?.ui?.messages[0]?.id === KRATOS_ERROR.EXISTING_USER) {
            setHint('This email address is already in use');
          }

          return;
        }

        setActiveDisplay(Display.Default);
        await refetchSession();
      },
    },
  );

  const onChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const input = Array.from(form.elements).find(
      (el) => el.getAttribute('name') === 'traits.email',
    ) as HTMLInputElement;
    const changedEmail = input?.value?.trim();

    if (!changedEmail) {
      return;
    }

    const { action, nodes } = settings.ui;
    const csrfToken = getNodeValue('csrf_token', nodes);
    changeEmail({
      action,
      params: {
        csrf_token: csrfToken,
        method: 'profile',
        'traits.email': changedEmail,
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
      onSuccess: ({ redirect, error, code }, vars) => {
        if (redirect) {
          if (code === 403) {
            initializePrivilegedSession(redirect, () => updateSettings(vars));
            return;
          }

          window.open(redirect);
          return;
        }

        if (error) {
          if (error.ui?.messages?.[0].id === KRATOS_ERROR.SINGLE_OIDC) {
            displayToast('You must have at least one provider');
          }
          return;
        }

        const { params } = vars;
        if ('link' in params || 'unlink' in params) {
          refetchProviders();
        }
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
            email={session?.identity?.traits?.email}
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
          isReady={isReady}
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
