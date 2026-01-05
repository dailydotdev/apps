import React, { useState } from 'react';
import type { FormEvent, MutableRefObject, ReactElement } from 'react';
import { providerMap } from '@dailydotdev/shared/src/components/auth/common';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { LockIcon, MailIcon } from '@dailydotdev/shared/src/components/icons';
import AccountDangerZone from '@dailydotdev/shared/src/components/profile/AccountDangerZone';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import type {
  AuthSession,
  KratosProviderData,
} from '@dailydotdev/shared/src/lib/kratos';
import {
  AuthEvent,
  AuthFlow,
  getKratosSettingsFlow,
  KRATOS_ERROR,
} from '@dailydotdev/shared/src/lib/kratos';
import { PasswordField } from '@dailydotdev/shared/src/components/fields/PasswordField';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import type { PromptOptions } from '@dailydotdev/shared/src/hooks/usePrompt';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { useSignBack } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import {
  useEventListener,
  useToastNotification,
} from '@dailydotdev/shared/src/hooks';
import { capitalize } from '@dailydotdev/shared/src/lib/strings';
import { BOOT_LOCAL_KEY } from '@dailydotdev/shared/src/contexts/common';
import { DEFAULT_ERROR } from '@dailydotdev/shared/src/graphql/common';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { useMutation } from '@tanstack/react-query';
import AccountContentSection from '../AccountContentSection';
import { AccountPageContainer } from '../AccountPageContainer';
import type { ManageSocialProvidersProps } from '../common';
import { AccountSecurityDisplay as Display, AccountTextField } from '../common';
import EmailSentSection from '../EmailSentSection';
import AccountLoginSection from './AccountLoginSection';

const providers = Object.values(providerMap);

export interface ChangePasswordParams {
  password: string;
}

export interface UpdateProvidersParams {
  link?: string;
  unlink?: string;
}

const removeProviderList = Object.values({
  ...providerMap,
  google: {
    ...providerMap.google,
    icon: {
      ...providerMap.google.icon,
      props: {
        ...providerMap.google.icon.props,
        secondary: false,
      },
    },
  },
  facebook: {
    ...providerMap.facebook,
    icon: {
      ...providerMap.facebook.icon,
      props: {
        ...providerMap.facebook.icon.props,
        secondary: false,
      },
    },
  },
});

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
  title: 'Already linked to another account',
  okButton: null,
};
const unlinkProviderPromptOptions: PromptOptions = {
  title: 'Remove provider?',
  description: "You won't be able to log in with this account anymore",
  okButton: {
    title: 'Remove',
    color: ButtonColor.Ketchup,
  },
};
const deleteAccountPromptOptions: PromptOptions = {
  title: 'Delete account?',
  description:
    'This will permanently delete your account and all associated data. This cannot be undone.',
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
  const { deleteAccount } = useAuthContext();
  const { displayToast } = useToastNotification();
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
      description: `This ${provider} account is already linked to a different daily.dev account.`,
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
  const { mutate: deleteAccountPrompt, isPending: isDeleting } = useMutation({
    mutationKey: ['deleteAccount'],
    mutationFn: async () => {
      if (await showPrompt(deleteAccountPromptOptions)) {
        await deleteAccount();
      }
    },
    onError: () => {
      displayToast(DEFAULT_ERROR);
    },
    onSuccess: async () => {
      await onUpdateSignBack(null, null);
      globalThis?.localStorage.removeItem(BOOT_LOCAL_KEY);
      window.location.replace('/');
    },
  });

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
    <AccountPageContainer title="Account access">
      <AccountContentSection
        className={{ heading: 'mt-0' }}
        title="Email"
        description="Primary email for your account"
      >
        <Tooltip
          side="bottom"
          visible={!hasPassword}
          content={
            <div className="w-60 py-2 typo-subhead">
              Set a password first to change your email
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
        </Tooltip>
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
        title="Login methods"
        description="Link additional accounts for backup access and easier sign-in"
        providerActionType="link"
        providerAction={manageSocialProviders}
        providers={providers.filter(
          ({ value }) => !userProviders?.result.includes(value),
        )}
      />
      <AccountLoginSection
        title="Connected accounts"
        description="Accounts currently linked to your profile"
        providerAction={({ provider }) => unlinkProvider(provider)}
        providerActionType="unlink"
        className={{ button: 'hover:bg-accent-ketchup-default' }}
        buttonVariant={ButtonVariant.Secondary}
        providers={removeProviderList.filter(({ value }) =>
          userProviders?.result.includes(value),
        )}
      />
      <AccountContentSection
        title="Password"
        description="Set or update your account password"
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
      <AccountContentSection title="🚨 Danger zone">
        <AccountDangerZone
          onDelete={() => deleteAccountPrompt()}
          className="mt-6"
          buttonLoading={isDeleting}
        />
      </AccountContentSection>
    </AccountPageContainer>
  );
}

export default AccountSecurityDefault;
