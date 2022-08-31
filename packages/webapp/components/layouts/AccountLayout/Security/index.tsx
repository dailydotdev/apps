import { getProviderMapClone } from '@dailydotdev/shared/src/components/auth/common';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import LockIcon from '@dailydotdev/shared/src/components/icons/Lock';
import MailIcon from '@dailydotdev/shared/src/components/icons/Mail';
import AccountDangerZone from '@dailydotdev/shared/src/components/profile/AccountDangerZone';
import { AlertBackground } from '@dailydotdev/shared/src/components/alert/AlertContainer';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import React, {
  FormEvent,
  MutableRefObject,
  ReactElement,
  useContext,
  useState,
} from 'react';
import { useMutation, useQuery } from 'react-query';
import {
  AuthEvent,
  AuthFlow,
  getKratosProviders,
  getKratosSettingsFlow,
  initializeKratosFlow,
  SocialRegistrationFlow,
  submitKratosFlow,
} from '@dailydotdev/shared/src/lib/kratos';
import UnlinkModal from '@dailydotdev/shared/src/components/modals/UnlinkModal';
import { getNodeByKey, SettingsParams } from '@dailydotdev/shared/src/lib/auth';
import DeleteAccountModal from '@dailydotdev/shared/src/components/modals/DeleteAccountModal';
import DeletedAccountConfirmationModal from '@dailydotdev/shared/src/components/modals/DeletedAccountConfirmationModal';
import useWindowEvents from '@dailydotdev/shared/src/hooks/useWindowEvents';
import AlreadyLinkedModal from '@dailydotdev/shared/src/components/modals/AlreadyLinkedModal';
import { PasswordField } from '@dailydotdev/shared/src/components/fields/PasswordField';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
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

export interface ChangePasswordParams {
  password: string;
}

interface AccountSecurityDefaultProps {
  isEmailSent?: boolean;
  updatePasswordRef: MutableRefObject<HTMLFormElement>;
  onSwitchDisplay: (display: Display) => void;
  onUpdatePassword: (form: ChangePasswordParams) => void;
}

export interface ManageSocialProvidersProps {
  type: ManageSocialProviderTypes;
  provider: string;
}

function AccountSecurityDefault({
  isEmailSent,
  updatePasswordRef,
  onSwitchDisplay,
  onUpdatePassword,
}: AccountSecurityDefaultProps): ReactElement {
  const { user, deleteAccount } = useContext(AuthContext);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletedAccount, setDeletedAccount] = useState(false);
  const [alreadyLinkedProvider, setAlreadyLinkedProvider] = useState(false);
  const [linkProvider, setLinkProvider] = useState(null);
  const [unlinkProvider, setUnlinkProvider] = useState(null);
  const [, setEmail] = useState<string>(null);
  const { data: userProviders } = useQuery('providers', getKratosProviders);
  const { data: settings } = useQuery('settings', () =>
    initializeKratosFlow(AuthFlow.Settings),
  );

  useWindowEvents<SocialRegistrationFlow>(
    'message',
    AuthEvent.SocialRegistration,
    async (e) => {
      if (e.data?.flow) {
        const flow = await getKratosSettingsFlow(
          AuthFlow.Settings,
          e.data.flow,
        );
        const { ui } = flow;
        const error = ui.messages[0]?.id;
        if (error === 4000007) {
          // Provider is already linked to another account
          setAlreadyLinkedProvider(true);
        }
      }
    },
  );

  const { mutateAsync: updateSettings } = useMutation(
    (params: SettingsParams) => submitKratosFlow(params),
    {
      onSuccess: (data) => {
        if (data?.redirect) {
          window.open(data.redirect);
        }
        // TODO: We need to adjust the protected flow here
      },
    },
  );

  const manageSocialProviders = async ({
    type,
    provider,
  }: ManageSocialProvidersProps) => {
    setLinkProvider(provider);
    const { nodes, action } = settings.ui;
    const csrfToken = getNodeByKey('csrf_token', nodes);
    const postData = {
      csrf_token: csrfToken.attributes.value,
      [type]: provider,
    };
    await updateSettings({ action, params: postData });
  };

  const onChangePassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formToJson<{ password: string }>(e.currentTarget);
    onUpdatePassword(form);
  };

  const emailAction = isEmailSent ? (
    <EmailSentSection className="max-w-sm" />
  ) : (
    <Button
      className="mt-6 w-fit btn-secondary"
      onClick={() => onSwitchDisplay(Display.ChangeEmail)}
    >
      Change email
    </Button>
  );

  return (
    <AccountPageContainer title="Security">
      <AccountContentSection
        headingClassName="mt-0"
        title="Account email"
        description="The email address associated with your daily.dev account"
      >
        <AccountTextField
          fieldType="tertiary"
          value={user.email}
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
      />
      <AccountLoginSection
        title="Connected accounts"
        description="Remove the connection between daily.dev and authorized login providers."
        providerAction={manageSocialProviders}
        providerActionType="unlink"
        providers={providers.filter(({ provider }) =>
          userProviders?.result.includes(provider.toLowerCase()),
        )}
      />
      <AccountContentSection
        title="Set your password"
        description="Please enter your new password"
      >
        <form
          ref={updatePasswordRef}
          className="flex flex-col"
          onSubmit={onChangePassword}
        >
          <PasswordField
            className="mt-6 max-w-sm"
            inputId="new_password"
            label="Password"
            name="password"
            showStrength={false}
          />
          <Button type="submit" className="mt-6 w-fit btn-secondary">
            Set password
          </Button>
        </form>
      </AccountContentSection>
      <AccountContentSection title="🚨 Danger Zone">
        <AccountDangerZone
          onDelete={() => setShowDeleteAccount(true)}
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
      {showDeleteAccount && (
        <DeleteAccountModal
          deleteAccount={deleteAccount}
          isOpen={showDeleteAccount}
          onDelete={() => setDeletedAccount(true)}
          onRequestClose={() => setShowDeleteAccount(false)}
        />
      )}
      {deletedAccount && (
        <DeletedAccountConfirmationModal
          isOpen={deletedAccount}
          onRequestClose={() => window.location.reload()}
        />
      )}
      {alreadyLinkedProvider && (
        <AlreadyLinkedModal
          provider={linkProvider}
          isOpen={alreadyLinkedProvider}
          onRequestClose={() => setAlreadyLinkedProvider(false)}
        />
      )}
    </AccountPageContainer>
  );
}

export default AccountSecurityDefault;
