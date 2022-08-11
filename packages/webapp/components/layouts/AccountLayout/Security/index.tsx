import { getProviderMapClone } from '@dailydotdev/shared/src/components/auth/common';
import ProviderButton from '@dailydotdev/shared/src/components/auth/ProviderButton';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import LockIcon from '@dailydotdev/shared/src/components/icons/Lock';
import MailIcon from '@dailydotdev/shared/src/components/icons/Mail';
import AccountDangerZone from '@dailydotdev/shared/src/components/profile/AccountDangerZone';
import { Overlay } from '@dailydotdev/shared/src/components/utilities';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import React, { ReactElement, useContext, useState } from 'react';
import AccountContentSection from '../AccountContentSection';
import { AccountPageContainer } from '../AccountPageContainer';
import {
  AccountSecurityDisplay as Display,
  AccountTextField,
  OverlayContainer,
  OverlayText,
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

function AccountSecurityDefault({
  isEmailSent,
  onSwitchDisplay,
}: AccountSecurityDefaultProps): ReactElement {
  const { user } = useContext(AuthContext);
  const [email, setEmail] = useState<string>(null);
  const [resetPasswordSent, setResetPasswordSent] = useState(false);

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
        providers={providers.filter(
          ({ provider }) => !user.providers.includes(provider.toLowerCase()),
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
        providers={providers.filter(({ provider }) =>
          user.providers.includes(provider.toLowerCase()),
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
          onClick={() => setResetPasswordSent(true)}
        >
          Reset password
        </Button>
      </AccountContentSection>
      {/* )} */}
      {resetPasswordSent && (
        <OverlayContainer className="mt-6">
          <Overlay className="bg-overlay-primary-white opacity-[0.12]" />
          <OverlayText>
            We sent a link to the account email address, please check your spam
            folder if you {`don't`} see the email.
          </OverlayText>
        </OverlayContainer>
      )}
      <AccountContentSection title="🚨 Danger Zone">
        <AccountDangerZone
          onDelete={onDelete}
          className="overflow-hidden relative py-4 px-6 mt-6 rounded-26 border border-theme-status-error"
        >
          <Overlay className="bg-overlay-quaternary-ketchup" />
        </AccountDangerZone>
      </AccountContentSection>
    </AccountPageContainer>
  );
}

export default AccountSecurityDefault;
