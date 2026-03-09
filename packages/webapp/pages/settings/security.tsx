import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import usePrivilegedSession from '@dailydotdev/shared/src/hooks/usePrivilegedSession';
import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SuccessfulRegistrationData } from '@dailydotdev/shared/src/lib/kratos';
import {
  AuthEvent,
  AuthFlow,
  ContinueWithAction,
  getKratosProviders,
  getKratosSession,
  initializeKratosFlow,
  KRATOS_ERROR,
  submitKratosFlow,
} from '@dailydotdev/shared/src/lib/kratos';
import type {
  SettingsParams,
  ValidateChangeEmail,
  ValidateResetPassword,
} from '@dailydotdev/shared/src/lib/auth';
import { getNodeValue } from '@dailydotdev/shared/src/lib/auth';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useEventListener } from '@dailydotdev/shared/src/hooks/useEventListener';
import { broadcastChannel } from '@dailydotdev/shared/src/lib/constants';
import type { SignBackProvider } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import { useSignBack } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useIsBetterAuth } from '@dailydotdev/shared/src/hooks/useIsBetterAuth';
import {
  getBetterAuthProviders,
  getBetterAuthLinkSocialUrl,
  unlinkBetterAuthAccount,
  betterAuthSetPassword,
  betterAuthChangeEmail,
  betterAuthVerifyChangeEmail,
} from '@dailydotdev/shared/src/lib/betterAuth';
import type { NextSeoProps } from 'next-seo';
import { AccountSecurityDisplay as Display } from '../../components/layouts/SettingsLayout/common';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import type {
  ChangePasswordParams,
  UpdateProvidersParams,
} from '../../components/layouts/SettingsLayout/Security';
import AccountSecurityDefault from '../../components/layouts/SettingsLayout/Security';
import EmailFormPage from '../../components/layouts/SettingsLayout/Security/EmailFormPage';
import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Manage account security'),
};

const BETTER_AUTH_CHANGE_EMAIL_MESSAGE =
  'If that email is available, we sent a verification code.';

const AccountSecurityPage = (): ReactElement => {
  const updatePasswordRef = useRef<HTMLFormElement>();
  const { user, refetchBoot } = useAuthContext();
  const { displayToast } = useToastNotification();
  const [activeDisplay, setActiveDisplay] = useState(Display.Default);
  const [verificationId, setVerificationId] = useState<string>();
  const [hint, setHint] = useState<string>();
  const { onUpdateSignBack, signBack, provider } = useSignBack();
  const isBetterAuth = useIsBetterAuth();
  const providersKey = generateQueryKey(RequestKey.Providers, user);
  const client = useQueryClient();
  const { data: userProviders } = useQuery({
    queryKey: providersKey,
    queryFn: () =>
      isBetterAuth ? getBetterAuthProviders() : getKratosProviders(),
  });
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => initializeKratosFlow(AuthFlow.Settings),
    enabled: !isBetterAuth,
  });

  const onSetPassword = () => {
    displayToast('Password changed successfully!');
    updatePasswordRef.current?.reset();
  };

  const { initializePrivilegedSession } = usePrivilegedSession({
    providers: userProviders?.result,
  });
  const { mutateAsync: resetPassword } = useMutation({
    mutationFn: (params: ValidateResetPassword) => submitKratosFlow(params),

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
  });

  const hasPassword = userProviders?.result?.includes('password');

  const onUpdatePasswordBetterAuth = async ({
    password,
  }: ChangePasswordParams) => {
    if (hasPassword) {
      displayToast('Use forgot password to update your existing password');
      return;
    }
    const result = await betterAuthSetPassword(password);
    if (result.status) {
      onSetPassword();
      await client.invalidateQueries({ queryKey: providersKey });
    } else if (result.error) {
      displayToast(result.error);
    }
  };

  const onUpdatePassword = async ({ password }: ChangePasswordParams) => {
    if (isBetterAuth) {
      await onUpdatePasswordBetterAuth({ password });
      return;
    }
    if (!settings?.ui) {
      return;
    }
    const { action, nodes } = settings.ui;
    const csrfToken = getNodeValue('csrf_token', nodes);
    resetPassword({
      action,
      params: { csrf_token: csrfToken, method: 'password', password },
    });
  };
  const sessionKey = generateQueryKey(RequestKey.CurrentSession, user);
  const { mutateAsync: changeEmail } = useMutation({
    mutationFn: (params: ValidateChangeEmail) => {
      setHint(undefined);
      return submitKratosFlow(params);
    },

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
  });

  const { data: kratos } = useQuery({
    queryKey: sessionKey,
    queryFn: getKratosSession,
    enabled: !isBetterAuth,
  });
  const { session } = kratos ?? {};
  const onVerifyCodeBetterAuth = async (code: string) => {
    const result = await betterAuthVerifyChangeEmail(code);
    if (result.error) {
      throw new Error(result.error);
    }
    displayToast('Your email address has been updated.');
    setActiveDisplay(Display.Default);
    await refetchBoot?.();
  };

  const onChangeEmail = async (email: string) => {
    if (!email) {
      return;
    }

    if (isBetterAuth) {
      setHint(undefined);
      const result = await betterAuthChangeEmail(email);
      if (result.error) {
        setHint(result.error);
        return;
      }
      if (result.status) {
        displayToast(BETTER_AUTH_CHANGE_EMAIL_MESSAGE);
      }
      return;
    }

    if (!settings?.ui) {
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
    await client.invalidateQueries({ queryKey: sessionKey });
  };

  const { mutateAsync: updateSettings } = useMutation({
    mutationFn: (params: SettingsParams) => submitKratosFlow(params),

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
        client.invalidateQueries({ queryKey: providersKey });

        if ('unlink' in params && params.unlink === provider) {
          const validProvider = userProviders?.result?.find(
            (userProvider) => userProvider !== provider,
          );
          onUpdateSignBack(signBack, validProvider as SignBackProvider);
        }
      }
    },
  });

  const updateSocialProvidersBetterAuth = async (
    postData: UpdateProvidersParams,
  ) => {
    if ('link' in postData && postData.link) {
      const callbackURL = `${window.location.origin}/callback?login=true`;
      const url = getBetterAuthLinkSocialUrl(postData.link, callbackURL);
      const popup = window.open();
      if (popup) {
        popup.location.href = url;
      }
    } else if ('unlink' in postData && postData.unlink) {
      const result = await unlinkBetterAuthAccount(postData.unlink);
      if (result.status) {
        await client.invalidateQueries({ queryKey: providersKey });
        if (postData.unlink === provider) {
          const validProvider = userProviders?.result?.find(
            (userProvider) => userProvider !== postData.unlink,
          );
          onUpdateSignBack(signBack, validProvider as SignBackProvider);
        }
      } else {
        displayToast('You must have at least one provider');
      }
    }
  };

  const updateSocialProviders = async (postData: UpdateProvidersParams) => {
    if (isBetterAuth) {
      await updateSocialProvidersBetterAuth(postData);
      return;
    }
    if (!settings?.ui) {
      return;
    }
    const { action, nodes } = settings.ui;
    const csrfToken = getNodeValue('csrf_token', nodes);
    const params = { ...postData, csrf_token: csrfToken };
    updateSettings({ action, params });
  };

  const onLinkProviderMessage = async (e: MessageEvent) => {
    if (!isBetterAuth) {
      return;
    }
    if (e.data?.eventKey !== AuthEvent.Login) {
      return;
    }
    await client.invalidateQueries({ queryKey: providersKey });
  };

  useEventListener(globalThis, 'message', onLinkProviderMessage);
  useEventListener(broadcastChannel, 'message', onLinkProviderMessage);

  return (
    <TabContainer showHeader={false} controlledActive={activeDisplay}>
      <Tab label={Display.Default}>
        <AccountSecurityDefault
          email={isBetterAuth ? user?.email : session?.identity?.traits?.email}
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
          onVerifyCode={isBetterAuth ? onVerifyCodeBetterAuth : undefined}
        />
      </Tab>
    </TabContainer>
  );
};

AccountSecurityPage.getLayout = getSettingsLayout;
AccountSecurityPage.layoutProps = { seo };

export default AccountSecurityPage;
