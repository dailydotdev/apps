import { getProviderMapClone } from '@dailydotdev/shared/src/components/auth/common';
import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import ProviderButton from '@dailydotdev/shared/src/components/auth/ProviderButton';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import AccountDangerZone from '@dailydotdev/shared/src/components/profile/AccountDangerZone';
import MailIcon from '@dailydotdev/shared/src/components/icons/Mail';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import LockIcon from '@dailydotdev/shared/src/components/icons/Lock';
import { Overlay } from '@dailydotdev/shared/src/components/utilities';
import React, { ReactElement, useContext, useState } from 'react';
import {
  AccountContentHeading,
  AccountPageContainer,
  AccountTextField,
  ContentHeading,
  ContentText,
  OverlayContainer,
  OverlayText,
} from '../../components/layouts/AccountLayout/common';
import EmailForm from '../../components/layouts/AccountLayout/EmailForm';
import { getAccountLayout } from '../../components/layouts/AccountLayout';

const socialProvider = getProviderMapClone();
socialProvider.gitHub.style = { backgroundColor: '#383C47' };
socialProvider.apple.style = { backgroundColor: '#404551' };
const providers = Object.values(socialProvider);

enum Display {
  Default = 'default',
  ChangeEmail = 'change_email',
  ConnectEmail = 'connect_email',
}

const AccountSecurityPage = (): ReactElement => {
  const { user } = useContext(AuthContext);
  const [email, setEmail] = useState<string>();
  const [emailSent, setEmailSent] = useState(false);
  const [resetPasswordSent, setResetPasswordSent] = useState(false);
  const [activeDisplay, setActiveDisplay] = useState(Display.Default);

  if (!user) {
    return null;
  }

  const onDelete = () => {};
  const onChangeEmail = () => {
    setEmailSent(true);
    setActiveDisplay(Display.Default);
  };

  const onConnectEmail = () => {
    setEmailSent(true);
    setActiveDisplay(Display.Default);
  };

  const renderEmailAction = () => {
    if (emailSent) {
      return (
        <OverlayContainer className="mt-6 border-theme-status-warning">
          <Overlay className="bg-overlay-quaternary-bun" />
          <p>
            We sent an email to verify your account. Please check your spam
            folder if you {`don't`} see the email.
          </p>
          <span className="flex flex-row gap-4 mt-4">
            <Button buttonSize="xsmall" className="w-fit btn-primary">
              Resend
            </Button>
            <Button buttonSize="xsmall" className="w-fit btn-secondary">
              Cancel Request
            </Button>
          </span>
        </OverlayContainer>
      );
    }

    return (
      // return user.password ? ( // temporary enabling
      <Button
        className="mt-6 w-fit btn-secondary"
        onClick={() => setActiveDisplay(Display.ChangeEmail)}
      >
        Change email
      </Button>
    );
  };

  return (
    <TabContainer showHeader={false} controlledActive={activeDisplay}>
      <Tab label={Display.Default}>
        <AccountPageContainer title="Security">
          <ContentHeading>Account email</ContentHeading>
          <ContentText>
            The email address associated with your daily.dev account
          </ContentText>
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
          {renderEmailAction()}
          <AccountContentHeading>Add login account</AccountContentHeading>
          <ContentText>
            Add more accounts to ensure you never lose access to your daily.dev
            profile and to make login quick and easy cross device
          </ContentText>
          <div className="grid grid-cols-1 gap-4 mt-6 w-64">
            {providers
              .filter(
                ({ provider }) =>
                  !user.providers.includes(provider.toLowerCase()),
              )
              .map(({ provider, ...rest }) => (
                <ProviderButton
                  key={provider}
                  label="Connect with"
                  provider={provider}
                  {...rest}
                />
              ))}
            {!user.password && (
              <ProviderButton
                label="Connect with"
                provider="Email"
                icon={<MailIcon secondary />}
                onClick={() => setActiveDisplay(Display.ConnectEmail)}
                style={socialProvider.gitHub.style}
              />
            )}
          </div>
          <AccountContentHeading>Connected accounts</AccountContentHeading>
          <ContentText>
            Remove the connection between daily.dev and authorized login
            providers.
          </ContentText>
          <div className="grid grid-cols-1 gap-4 mt-6 w-64">
            {providers
              .filter(({ provider }) =>
                user.providers.includes(provider.toLowerCase()),
              )
              .map(({ provider, ...rest }) => (
                <ProviderButton
                  key={provider}
                  label="Remove"
                  provider={provider}
                  {...rest}
                  style={{ background: 'var(--theme-background-tertiary)' }}
                  className="hover:bg-theme-status-error"
                />
              ))}
            {user.password && (
              <ProviderButton
                label="Remove"
                provider="Email"
                icon={<MailIcon secondary />}
                onClick={() => setActiveDisplay(Display.ConnectEmail)}
                className="bg-theme-bg-tertiary hover:bg-theme-status-error"
              />
            )}
          </div>
          {/* {user.password && ( // temporary enabling */}
          <>
            <AccountContentHeading>Account Password</AccountContentHeading>
            <ContentText>Change your account password</ContentText>
            <Button
              className="mt-6 w-fit btn-secondary"
              onClick={() => setResetPasswordSent(true)}
            >
              Reset password
            </Button>
          </>
          {/* )} */}
          {resetPasswordSent && (
            <OverlayContainer className="mt-6">
              <Overlay className="bg-overlay-primary-white opacity-[0.12]" />
              <OverlayText>
                We sent a link to the account email address, please check your
                spam folder if you {`don't`} see the email.
              </OverlayText>
            </OverlayContainer>
          )}
          <AccountContentHeading>🚨 Danger Zone</AccountContentHeading>
          <AccountDangerZone
            onDelete={onDelete}
            className="overflow-hidden relative py-4 px-6 mt-6 rounded-26 border border-theme-status-error"
          >
            <Overlay className="bg-overlay-quaternary-ketchup" />
          </AccountDangerZone>
        </AccountPageContainer>
      </Tab>
      <Tab label={Display.ChangeEmail}>
        <AccountPageContainer
          title="Change email"
          onBack={() => setActiveDisplay(Display.Default)}
          className={{ section: 'max-w-sm' }}
        >
          <EmailForm onSubmit={onChangeEmail} />
        </AccountPageContainer>
      </Tab>
      <Tab label={Display.ConnectEmail}>
        <AccountPageContainer
          title="Change email"
          onBack={() => setActiveDisplay(Display.Default)}
          className={{ section: 'max-w-sm' }}
        >
          <EmailForm onSubmit={onConnectEmail} />
        </AccountPageContainer>
      </Tab>
    </TabContainer>
  );
};

AccountSecurityPage.getLayout = getAccountLayout;

export default AccountSecurityPage;
