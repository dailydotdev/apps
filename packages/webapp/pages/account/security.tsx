import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import usePrivilegedSession from '@dailydotdev/shared/src/hooks/usePrivilegedSession';
import React, { ReactElement, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AuthFlow,
  ContinueWithAction,
  getKratosProviders,
  getKratosSession,
  initializeKratosFlow,
  KRATOS_ERROR,
  submitKratosFlow,
  SuccessfulRegistrationData,
} from '@dailydotdev/shared/src/lib/kratos';
import {
  getNodeValue,
  SettingsParams,
  ValidateChangeEmail,
  ValidateResetPassword,
} from '@dailydotdev/shared/src/lib/auth';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import {
  SignBackProvider,
  useSignBack,
} from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AccountSecurityDisplay as Display } from '../../components/layouts/AccountLayout/common';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import AccountSecurityDefault, {
  ChangePasswordParams,
  UpdateProvidersParams,
} from '../../components/layouts/AccountLayout/Security';
import EmailFormPage from '../../components/layouts/AccountLayout/Security/EmailFormPage';

const AccountSecurityPage = (): ReactElement => {
  const updatePasswordRef = useRef<HTMLFormElement>();
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const [activeDisplay, setActiveDisplay] = useState(Display.Default);
  const [verificationId, setVerificationId] = useState<string>();
  const [hint, setHint] = useState<string>();
  const { onUpdateSignBack, signBack, provider } = useSignBack();
  const providersKey = generateQueryKey(RequestKey.Providers, user);
  const { data: userProviders } = useQuery(providersKey, () =>
    getKratosProviders(),
  );
  const { data: settings } = useQuery(['settings'], () =>
    initializeKratosFlow(AuthFlow.Settings),
  );

  const onSetPassword = () => {
    displayToast('Password changed successfully!');
    updatePasswordRef.current?.reset();
  };

  const { initializePrivilegedSession } = usePrivilegedSession({
    providers: userProviders?.result,
  });
  const { mutateAsync: resetPassword } = useMutation(
    (params: ValidateResetPassword) => submitKratosFlow(params),
    {
      onSuccess: ({ redirect, error, code }, params) => {
        if (redirect && code === 403) {
          const onVerified = () => resetPassword(params);
          return initializePrivilegedSession?.(redirect, onVerified);
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

  const client = useQueryClient();
  const sessionKey = generateQueryKey(RequestKey.CurrentSession, user);
  const { mutateAsync: changeEmail } = useMutation(
    (params: ValidateChangeEmail) => {
      setHint(undefined);
      return submitKratosFlow(params);
    },
    {
      onSuccess: async ({ data, redirect, error, code }, params) => {
        if (redirect && code === 403) {
          const onVerified = () => changeEmail(params);
          initializePrivilegedSession?.(redirect, onVerified);
          return;
        }

        if (error) {
          if (error?.ui?.messages?.[0]?.id === KRATOS_ERROR.EXISTING_USER) {
            setHint('This email address is already in use');
          }
        }

        const successfulData = data as SuccessfulRegistrationData;

        if (successfulData?.continue_with?.length) {
          const continueWith = successfulData.continue_with.find(
            ({ action }) => action === ContinueWithAction.ShowVerification,
          );

          if (continueWith) {
            setVerificationId(continueWith.flow.id);
          }
        }
      },
    },
  );

  const { data: kratos } = useQuery(sessionKey, getKratosSession);
  const { session } = kratos ?? {};
  const onChangeEmail = async (email: string) => {
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

  const onVerifySuccess = async (): Promise<void> => {
    displayToast('Your email address has been updated.');
    setActiveDisplay(Display.Default);
    await client.invalidateQueries(sessionKey);
  };

  const { mutateAsync: updateSettings } = useMutation(
    (params: SettingsParams) => submitKratosFlow(params),
    {
      onSuccess: ({ redirect, error, code }, vars) => {
        if (redirect) {
          if (code === 403) {
            initializePrivilegedSession?.(redirect, () => updateSettings(vars));
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
          client.invalidateQueries(providersKey);

          if ('unlink' in params && params.unlink === provider) {
            const validProvider = userProviders?.result?.find(
              (userProvider) => userProvider !== provider,
            );
            onUpdateSignBack(signBack, validProvider as SignBackProvider);
          }
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
          verificationId={verificationId}
          onVerifySuccess={onVerifySuccess}
        />
      </Tab>
    </TabContainer>
  );
};

AccountSecurityPage.getLayout = getAccountLayout;

export default AccountSecurityPage;
