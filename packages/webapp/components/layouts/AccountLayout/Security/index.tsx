import { getProviderMapClone } from '@dailydotdev/shared/src/components/auth/common';
import ProviderButton from '@dailydotdev/shared/src/components/auth/ProviderButton';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import LockIcon from '@dailydotdev/shared/src/components/icons/Lock';
import MailIcon from '@dailydotdev/shared/src/components/icons/Mail';
import AccountDangerZone from '@dailydotdev/shared/src/components/profile/AccountDangerZone';
import AlertContainer, {
  AlertBackground,
} from '@dailydotdev/shared/src/components/alert/AlertContainer';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import React, { ReactElement, useContext, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import {
  AuthFlow,
  getKratosProviders,
  initializeKratosFlow,
  submitKratosFlow,
} from '@dailydotdev/shared/src/lib/kratos';
import { disabledRefetch } from '@dailydotdev/shared/src/lib/func';
import UnlinkModal from '@dailydotdev/shared/src/components/modals/UnlinkModal';
import { getNodeByKey, SettingsParams } from '@dailydotdev/shared/src/lib/auth';
import AccountContentSection from '../AccountContentSection';
import { AccountPageContainer } from '../AccountPageContainer';
import {
  AccountSecurityDisplay as Display,
  AccountTextField,
  ManageSocialProviderTypes,
} from '../common';
import EmailSentSection from '../EmailSentSection';
import AccountLoginSection from './AccountLoginSection';

const socialProvider = getProviderMapClone();
socialProvider.gitHub.style = { backgroundColor: '#383C47' };
socialProvider.apple.style = { backgroundColor: '#404551' };
const providers = Object.values(socialProvider);

interface AccountSecurityDefaultProps {
  isEmailSent?: boolean;
  onSwitchDisplay: (display: Display) => void;
}
export interface ManageSocialProvidersProps {
  type: ManageSocialProviderTypes;
  provider: string;
}

function AccountSecurityDefault({
  isEmailSent,
  onSwitchDisplay,
}: AccountSecurityDefaultProps): ReactElement {
  const { user } = useContext(AuthContext);
  const [unlinkProvider, setUnlinkProvider] = useState(null);
  const [email, setEmail] = useState<string>(null);
  const [resetPasswordSent, setResetPasswordSent] = useState(false);
  const { data: userProviders } = useQuery(
    'providers',
    () => getKratosProviders(user.id),
    {
      ...disabledRefetch,
    },
  );

  const { data: settings } = useQuery(
    'settings',
    () => initializeKratosFlow(AuthFlow.Settings),
    {
      ...disabledRefetch,
    },
  );

  const { mutateAsync: updateSettings } = useMutation(
    (params: SettingsParams) => submitKratosFlow(params),
    {
      onSuccess: () => {
        // TODO: We need to adjust the protected flow here
      },
    },
  );

  const manageSocialProviders = async ({
    type,
    provider,
  }: ManageSocialProvidersProps) => {
    const { nodes, action } = settings.ui;
    const csrfToken = getNodeByKey('csrf_token', nodes);
    const postData = {
      csrf_token: csrfToken.attributes.value,
      [type]: provider,
    };
    await updateSettings({ action, params: postData });
  };

  const emailAction = isEmailSent ? (
    <EmailSentSection />
  ) : (
    <Button
      className="mt-6 w-fit btn-secondary"
      onClick={() => onSwitchDisplay(Display.ChangeEmail)}
    >
      Change email
    </Button>
  );

  const onDelete = () => {};

  return (
    <AccountPageContainer title="Security">
      <AccountContentSection
        headingClassName="mt-0"
        title="Account email"
        description="The email address associated with your daily.dev account"
      >
        <AccountTextField
          fieldType="tertiary"
          value={email ?? user.email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          label="Email"
          inputId="email"
          leftIcon={<MailIcon />}
          rightIcon={<LockIcon className="text-theme-label-secondary" />}
          readOnly
        />
        {emailAction}
      </AccountContentSection>
      <AccountLoginSection
        title="Add login account"
        description="Add more accounts to ensure you never lose access to your daily.dev
        profile and to make login quick and easy cross device"
        providerActionType="link"
        providerAction={manageSocialProviders}
        providers={providers.filter(
          ({ provider }) =>
            !userProviders?.result.includes(provider.toLowerCase()),
        )}
        action={
          !user.password && (
            <ProviderButton
              label="Connect with"
              provider="Email"
              icon={<MailIcon secondary />}
              onClick={() => onSwitchDisplay(Display.ConnectEmail)}
              style={socialProvider.gitHub.style}
            />
          )
        }
      />
      <AccountLoginSection
        title="Connected accounts"
        description="Remove the connection between daily.dev and authorized login providers."
        providerAction={manageSocialProviders}
        providerActionType="unlink"
        providers={providers.filter(({ provider }) =>
          userProviders?.result.includes(provider.toLowerCase()),
        )}
        action={
          user.password && (
            <ProviderButton
              label="Remove"
              provider="Email"
              icon={<MailIcon secondary />}
              onClick={() => onSwitchDisplay(Display.ConnectEmail)}
              className="bg-theme-bg-tertiary hover:bg-theme-status-error"
            />
          )
        }
      />
      {/* {user.password && ( // temporary enabling */}
      <AccountContentSection
        title="Account Password"
        description="Change your account password"
      >
        <Button
          className="mt-6 w-fit btn-secondary"
          onClick={() => onSwitchDisplay(Display.ChangePassword)}
        >
          Reset password
        </Button>
      </AccountContentSection>
      {/* )} */}
      {resetPasswordSent && (
        <AlertContainer
          className={{
            container: 'mt-6',
            overlay: 'bg-overlay-primary-white opacity-[0.12]',
          }}
        >
          <p className="typo-callout">
            We sent a link to the account email address, please check your spam
            folder if you {`don't`} see the email.
          </p>
        </AlertContainer>
      )}
      <AccountContentSection title="🚨 Danger Zone">
        <AccountDangerZone
          onDelete={onDelete}
          className="overflow-hidden relative py-4 px-6 mt-6 rounded-26 border border-theme-status-error"
        >
          <AlertBackground className="bg-overlay-quaternary-ketchup" />
        </AccountDangerZone>
      </AccountContentSection>
      {unlinkProvider && (
        <UnlinkModal
          provider={unlinkProvider}
          onConfirm={() => {
            manageSocialProviders({ type: 'link', provider: unlinkProvider });
          }}
          onRequestClose={() => setUnlinkProvider(null)}
          isOpen={!!unlinkProvider}
        />
      )}
    </AccountPageContainer>
  );
}

export default AccountSecurityDefault;
