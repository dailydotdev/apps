import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthEvent } from '@dailydotdev/shared/src/lib/auth';
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
import { getPageSeoTitles } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  ...getPageSeoTitles('Account & Security'),
};

const BETTER_AUTH_CHANGE_EMAIL_MESSAGE =
  'If that email is available, we sent a verification code.';

const AccountSecurityPage = (): ReactElement => {
  const updatePasswordRef = useRef<HTMLFormElement | null>(null);
  const { user, refetchBoot } = useAuthContext();
  const { displayToast } = useToastNotification();
  const [activeDisplay, setActiveDisplay] = useState(Display.Default);
  const [hint, setHint] = useState<string>();
  const [pendingEmail, setPendingEmail] = useState<string>();
  const { onUpdateSignBack, signBack, provider } = useSignBack();
  const providersKey = generateQueryKey(RequestKey.Providers, user);
  const client = useQueryClient();
  const { data: userProviders } = useQuery({
    queryKey: providersKey,
    queryFn: () => getBetterAuthProviders(),
  });
  const onSetPassword = () => {
    displayToast('Password changed successfully!');
    updatePasswordRef.current?.reset();
  };

  const hasPassword = userProviders?.result?.includes('password');

  const onUpdatePassword = async ({ password }: ChangePasswordParams) => {
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
  const onVerifyCodeBetterAuth = async (code: string) => {
    if (!pendingEmail) {
      throw new Error('Request a verification code first');
    }
    const result = await betterAuthVerifyChangeEmail(pendingEmail, code);
    if (result.error) {
      throw new Error(result.error);
    }
    displayToast('Your email address has been updated.');
    setPendingEmail(undefined);
    setActiveDisplay(Display.Default);
    await refetchBoot?.();
  };

  const onChangeEmail = async (email: string) => {
    if (!email) {
      return;
    }

    setHint(undefined);
    const result = await betterAuthChangeEmail(email);
    if (result.error) {
      setHint(result.error);
      return;
    }
    if (result.success) {
      setPendingEmail(email);
      displayToast(BETTER_AUTH_CHANGE_EMAIL_MESSAGE);
    }
  };

  const updateSocialProviders = async (postData: UpdateProvidersParams) => {
    if ('link' in postData && postData.link) {
      const callbackURL = `${window.location.origin}/callback?login=true`;
      const url = await getBetterAuthLinkSocialUrl(postData.link, callbackURL);
      if (url) {
        window.open(url);
      }
    } else if ('unlink' in postData && postData.unlink) {
      const result = await unlinkBetterAuthAccount(postData.unlink);
      if (result.status) {
        await client.invalidateQueries({ queryKey: providersKey });
        if (postData.unlink === provider) {
          const validProvider = userProviders?.result?.find(
            (userProvider) => userProvider !== postData.unlink,
          );
          if (signBack && validProvider) {
            await onUpdateSignBack(signBack, validProvider as SignBackProvider);
          }
        }
      } else {
        displayToast('You must have at least one provider');
      }
    }
  };

  const onLinkProviderMessage = async (e: MessageEvent) => {
    if (e.data?.eventKey !== AuthEvent.Login) {
      return;
    }
    await client.invalidateQueries({ queryKey: providersKey });
  };

  useEventListener(
    globalThis as unknown as Window,
    'message',
    onLinkProviderMessage,
  );
  useEventListener(
    broadcastChannel as BroadcastChannel,
    'message',
    onLinkProviderMessage,
  );

  return (
    <TabContainer showHeader={false} controlledActive={activeDisplay}>
      <Tab label={Display.Default}>
        <AccountSecurityDefault
          email={user?.email}
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
          onVerifyCode={onVerifyCodeBetterAuth}
          onVerifySuccess={async () => {
            displayToast('Your email address has been updated.');
            setActiveDisplay(Display.Default);
          }}
        />
      </Tab>
    </TabContainer>
  );
};

AccountSecurityPage.getLayout = getSettingsLayout;
AccountSecurityPage.layoutProps = { seo };

export default AccountSecurityPage;
