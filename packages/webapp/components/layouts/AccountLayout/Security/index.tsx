import { getProviderMapClone } from '@dailydotdev/shared/src/components/auth/common';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { LockIcon, MailIcon } from '@dailydotdev/shared/src/components/icons';
import AccountDangerZone from '@dailydotdev/shared/src/components/profile/AccountDangerZone';
import { AlertBackground } from '@dailydotdev/shared/src/components/alert/common';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
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
  KRATOS_ERROR,
  KratosProviderData,
} from '@dailydotdev/shared/src/lib/kratos';
import { PasswordField } from '@dailydotdev/shared/src/components/fields/PasswordField';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import {
  PromptOptions,
  usePrompt,
} from '@dailydotdev/shared/src/hooks/usePrompt';
import { useSignBack } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import { useEventListener } from '@dailydotdev/shared/src/hooks';
import { capitalize } from '@dailydotdev/shared/src/lib/strings';
import { BOOT_LOCAL_KEY } from '@dailydotdev/shared/src/contexts/common';
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
const providers = Object.values(socialProvider);

export interface ChangePasswordParams {
  password: string;
}

export interface UpdateProvidersParams {
  link?: string;
  unlink?: string;
}

const removeProvider = getProviderMapClone();
removeProvider.google.icon.props.secondary = false;
removeProvider.facebook.icon.props.secondary = false;
const removeProviderList = Object.values(removeProvider);

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
  okButton: null,
};
const unlinkProviderPromptOptions: PromptOptions = {
  title: 'Remove provider?',
  description:
    'You will no longer be able to log in with this connected account',
  okButton: {
    title: 'Remove',
    color: ButtonColor.Ketchup,
  },
};
const deleteAccountPromptOptions: PromptOptions = {
  title: 'Delete account',
  description:
    'Are you sure you want to delete your account? This action cannot be undone.',
  okButton: {
    title: 'Yes, delete my account',
    color: ButtonColor.Ketchup,
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
  const { onUpdateSignBack } = useSignBack();
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
        title: `Remove ${capitalize(provider)}?`,
        okButton: {
          title: `Yes, remove ${capitalize(provider)}`,
          color: ButtonColor.Ketchup,
        },
      })
    ) {
      manageSocialProviders({ type: 'unlink', provider });
    }
  };
  const deleteAccountPrompt = async () => {
    if (await showPrompt(deleteAccountPromptOptions)) {
      await deleteAccount();
      await onUpdateSignBack(null, null);
      globalThis?.localStorage.removeItem(BOOT_LOCAL_KEY);
      window.location.replace('/');
    }
  };

  useEventListener(globalThis, 'message', async (e) => {
    if (e.data?.eventKey !== AuthEvent.SocialRegistration) {
      return;
    }

    if (e.data?.flow) {
      const flow = await getKratosSettingsFlow(AuthFlow.Settings, e.data.flow);
      const { ui } = flow;
      const error = ui.messages[0]?.id;
      if (error === KRATOS_ERROR.EXISTING_USER) {
        alreadyLinkedProvider(linkProvider);
      }
    }
  });

  const onChangePassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formToJson<{ password: string }>(e.currentTarget);
    onUpdatePassword(form);
  };

  const verifiable =
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
            <div className="w-60 py-2 typo-subhead">
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
            rightIcon={<LockIcon className="text-text-secondary" />}
            isLocked
          />
        </SimpleTooltip>
        {hasPassword && email && verifiable && !verifiable.verified && (
          <EmailSentSection email={email} className="max-w-sm" />
        )}
        {hasPassword && (
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
            className="mt-6 w-fit"
            onClick={() => onSwitchDisplay(Display.ChangeEmail)}
          >
            Change email
          </Button>
        )}
      </AccountContentSection>
      <AccountLoginSection
        buttonVariant={ButtonVariant.Primary}
        title="Add login account"
        description="Add more accounts to ensure you never lose access to your daily.dev
        profile and to make login quick and easy cross device"
        providerActionType="link"
        providerAction={manageSocialProviders}
        providers={providers.filter(
          ({ value }) => !userProviders?.result.includes(value),
        )}
      />
      <AccountLoginSection
        title="Connected accounts"
        description="Remove the connection between daily.dev and authorized login providers."
        providerAction={({ provider }) => unlinkProvider(provider)}
        providerActionType="unlink"
        className={{ button: 'hover:bg-accent-ketchup-default' }}
        buttonVariant={ButtonVariant.Secondary}
        providers={removeProviderList.filter(({ value }) =>
          userProviders?.result.includes(value),
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
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
            className="mt-6 w-fit"
          >
            Set password
          </Button>
        </form>
      </AccountContentSection>
      <AccountContentSection title="🚨 Danger Zone">
        <AccountDangerZone
          onDelete={() => deleteAccountPrompt()}
          className="relative mt-6 overflow-hidden rounded-26 border border-status-error px-6 py-4"
        >
          <AlertBackground className="bg-overlay-quaternary-ketchup" />
        </AccountDangerZone>
      </AccountContentSection>
    </AccountPageContainer>
  );
}

export default AccountSecurityDefault;
