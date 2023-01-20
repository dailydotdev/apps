import { getProviderMapClone } from '@dailydotdev/shared/src/components/auth/common';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import LockIcon from '@dailydotdev/shared/src/components/icons/Lock';
import MailIcon from '@dailydotdev/shared/src/components/icons/Mail';
import AccountDangerZone from '@dailydotdev/shared/src/components/profile/AccountDangerZone';
import { AlertBackground } from '@dailydotdev/shared/src/components/alert/common';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import classNames from 'classnames';
import React, {
  FormEvent,
  MutableRefObject,
  ReactElement,
  useContext,
  useState,
} from 'react';
import {
  AuthEvent,
  AuthFlow,
  AuthSession,
  getKratosSettingsFlow,
  KratosProviderData,
  SocialRegistrationFlow,
} from '@dailydotdev/shared/src/lib/kratos';
import useWindowEvents from '@dailydotdev/shared/src/hooks/useWindowEvents';
import { PasswordField } from '@dailydotdev/shared/src/components/fields/PasswordField';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import {
  PromptOptions,
  usePrompt,
} from '@dailydotdev/shared/src/hooks/usePrompt';
import AccountContentSection from '../AccountContentSection';
import { AccountPageContainer } from '../AccountPageContainer';
import {
  AccountSecurityDisplay as Display,
  AccountTextField,
  ManageSocialProvidersProps,
} from '../common';
import EmailSentSection from '../EmailSentSection';
import AccountLoginSection from './AccountLoginSection';

const socialProvider = getProviderMapClone();
socialProvider.github.style = { backgroundColor: '#383C47' };
socialProvider.apple.style = { backgroundColor: '#404551' };
const providers = Object.values(socialProvider);

export interface ChangePasswordParams {
  password: string;
}

export interface UpdateProvidersParams {
  link?: string;
  unlink?: string;
}

const removeProvider = getProviderMapClone();
removeProvider.google.icon.props = {
  ...removeProvider.google.icon.props,
  secondary: false,
};
const removeProviderList = Object.values(removeProvider).map(
  ({ style: { backgroundColor, ...style }, className, ...provider }) => ({
    ...provider,
    style: { ...style, color: 'var(--theme-label-primary)' },
    className: classNames(
      'bg-theme-bg-tertiary hover:bg-theme-color-ketchup text-theme-label-primary',
      className,
    ),
  }),
);

interface AccountSecurityDefaultProps {
  email?: string;
  session: AuthSession;
  isEmailSent?: boolean;
  userProviders?: KratosProviderData;
  updatePasswordRef: MutableRefObject<HTMLFormElement>;
  onSwitchDisplay: (display: Display) => void;
  onUpdatePassword: (form: ChangePasswordParams) => void;
  onUpdateProviders: (params: UpdateProvidersParams) => void;
}

const alreadyLinkedProviderOptions: PromptOptions = {
  title: 'Account already linked',
  cancelButton: {
    title: 'Close',
  },
  okButton: null,
};
const unlinkProviderPromptOptions: PromptOptions = {
  title: 'Remove provider?',
  description:
    'You will no longer be able to log in with this connected account',
  cancelButton: {
    title: 'Leave',
  },
  okButton: {
    title: 'Remove',
    className: 'text-white btn-primary-ketchup',
  },
};
const deleteAccountPromptOptions: PromptOptions = {
  title: 'Delete account',
  description:
    'Are you sure you want to delete your account? This action cannot be undone.',
  okButton: {
    title: 'Delete',
    className: 'btn-primary-ketchup',
  },
};

function AccountSecurityDefault({
  email,
  session,
  userProviders,
  updatePasswordRef,
  onSwitchDisplay,
  onUpdatePassword,
  onUpdateProviders,
}: AccountSecurityDefaultProps): ReactElement {
  const { deleteAccount } = useContext(AuthContext);
  const [linkProvider, setLinkProvider] = useState(null);
  const hasPassword = userProviders?.result?.includes('password');
  const { showPrompt } = usePrompt();

  const manageSocialProviders = async ({
    type,
    provider,
  }: ManageSocialProvidersProps) => {
    setLinkProvider(provider);
    onUpdateProviders({ [type]: provider });
  };
  const alreadyLinkedProvider = async (provider: string) => {
    await showPrompt({
      ...alreadyLinkedProviderOptions,
      description: `The “${provider}” account you trying to link, is already linked to another daily account.`,
    });
  };
  const unlinkProvider = async (provider: string) => {
    if (
      await showPrompt({
        ...unlinkProviderPromptOptions,
        title: `Remove ${provider}?`,
      })
    ) {
      manageSocialProviders({ type: 'unlink', provider });
    }
  };
  const deleteAccountPrompt = async () => {
    if (await showPrompt(deleteAccountPromptOptions)) {
      await deleteAccount();
      window.location.replace('/');
    }
  };

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
          alreadyLinkedProvider(linkProvider);
        }
      }
    },
  );

  const onChangePassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formToJson<{ password: string }>(e.currentTarget);
    onUpdatePassword(form);
  };

  const verifyable =
    email &&
    session?.identity?.verifiable_addresses?.find(
      (address) => address.value === email,
    );

  return (
    <AccountPageContainer title="Security">
      <AccountContentSection
        className={{ heading: 'mt-0' }}
        title="Account email"
        description="The email address associated with your daily.dev account"
      >
        <SimpleTooltip
          placement="bottom"
          disabled={hasPassword}
          content={
            <div className="py-2 w-60 typo-subhead">
              You must set a password for the account before you can change your
              email address.
            </div>
          }
        >
          <AccountTextField
            fieldType="tertiary"
            value={email}
            label="Email"
            inputId="email"
            data-testid="current_email"
            leftIcon={<MailIcon />}
            rightIcon={<LockIcon className="text-theme-label-secondary" />}
            isLocked
          />
        </SimpleTooltip>
        {hasPassword && email && verifyable && !verifyable.verified && (
          <EmailSentSection email={email} className="max-w-sm" />
        )}
        {hasPassword && (
          <Button
            buttonSize="small"
            className="mt-6 w-fit btn-secondary"
            onClick={() => onSwitchDisplay(Display.ChangeEmail)}
          >
            Change email
          </Button>
        )}
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
        providerAction={({ provider }) => unlinkProvider(provider)}
        providerActionType="unlink"
        providers={removeProviderList.filter(({ provider }) =>
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
            required
            minLength={6}
            className={{ container: 'mt-6 max-w-sm' }}
            inputId="new_password"
            label="Password"
            name="password"
          />
          <Button
            type="submit"
            buttonSize="small"
            className="mt-6 w-fit btn-secondary"
          >
            Set password
          </Button>
        </form>
      </AccountContentSection>
      <AccountContentSection title="🚨 Danger Zone">
        <AccountDangerZone
          onDelete={() => deleteAccountPrompt()}
          className="overflow-hidden relative py-4 px-6 mt-6 rounded-26 border border-theme-status-error"
        >
          <AlertBackground className="bg-overlay-quaternary-ketchup" />
        </AccountDangerZone>
      </AccountContentSection>
    </AccountPageContainer>
  );
}

export default AccountSecurityDefault;
