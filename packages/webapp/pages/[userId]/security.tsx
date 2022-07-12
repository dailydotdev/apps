import { getProviderMapClone } from '@dailydotdev/shared/src/components/auth/common';
import TabContainer, {
  Tab,
} from '@dailydotdev/shared/src/components/tabs/TabContainer';
import ProviderButton from '@dailydotdev/shared/src/components/auth/ProviderButton';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import AccountDangerZone from '@dailydotdev/shared/src/components/profile/AccountDangerZone';
import MailIcon from '@dailydotdev/shared/src/components/icons/Mail';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import React, { ReactElement, useContext, useState } from 'react';
import {
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import { getAccountDetailsLayout } from '../../components/layouts/ProfileLayout/AccountDetailsLayout';
import {
  AccountContentHeading,
  AccountPageContainer,
  AccountTextField,
  CommonTextField,
  ContentHeading,
  ContentText,
} from '../../components/layouts/ProfileLayout/common';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const socialProvider = getProviderMapClone();
socialProvider.gitHub.style = { backgroundColor: '#383C47' };
socialProvider.apple.style = { backgroundColor: '#404551' };
const providers = Object.values(socialProvider);

enum Display {
  Default = 'default',
  ChangeEmail = 'change_email',
}

const AccountSecurityPage = (): ReactElement => {
  const { user } = useContext(AuthContext);
  const [email, setEmail] = useState<string>();
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [activeDisplay, setActiveDisplay] = useState(Display.Default);

  if (!user) {
    return null;
  }

  const onDelete = () => {};
  const onSaveEmail = () => {
    setResetEmailSent(true);
    setActiveDisplay(Display.Default);
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
          />
          {resetEmailSent ? (
            <div className="relative p-4 mt-6 max-w-md rounded-8 border border-theme-status-warning">
              <div className="absolute inset-0 -z-1 w-full h-full opacity-24 bg-overlay-quaternary-bun" />
              <p className="typo-callout">
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
            </div>
          ) : (
            <Button
              className="mt-6 w-fit btn-secondary"
              onClick={() => setActiveDisplay(Display.ChangeEmail)}
            >
              Change email
            </Button>
          )}
          <AccountContentHeading>Add login account</AccountContentHeading>
          <ContentText>
            Add more accounts to ensure you never lose access to your daily.dev
            profile and to make login quick and easy cross device
          </ContentText>
          <div className="grid grid-cols-1 gap-4 mt-6 w-64">
            {providers.map(({ provider, ...rest }) => (
              <ProviderButton
                key={provider}
                label="Connect with"
                provider={provider}
                {...rest}
              />
            ))}
          </div>
          <AccountContentHeading>Account Password</AccountContentHeading>
          <ContentText>Change your account password</ContentText>
          <Button className="mt-6 w-fit btn-secondary">Reset password</Button>
          <AccountContentHeading>🚨 Danger Zone</AccountContentHeading>
          <AccountDangerZone
            onDelete={onDelete}
            className="overflow-hidden relative py-4 px-6 mt-6 rounded-26 border border-theme-status-error"
          >
            <div className="absolute inset-0 -z-1 w-full h-full opacity-24 bg-overlay-quaternary-ketchup" />
          </AccountDangerZone>
        </AccountPageContainer>
      </Tab>
      <Tab label={Display.ChangeEmail}>
        <AccountPageContainer
          title="Change email"
          onBack={() => setActiveDisplay(Display.Default)}
          className={{ section: 'max-w-sm' }}
        >
          <CommonTextField type="email" inputId="new_email" label="New email" />
          <AccountTextField
            label="Confirm current password"
            inputId="confirm_password"
            type="password"
          />
          <Button
            className="mt-6 ml-auto w-fit bg-theme-color-cabbage btn-quaternary"
            onClick={onSaveEmail}
          >
            Save changes
          </Button>
        </AccountPageContainer>
      </Tab>
    </TabContainer>
  );
};

AccountSecurityPage.getLayout = getAccountDetailsLayout;

export default AccountSecurityPage;
