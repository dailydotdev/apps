import { getProviderMapClone } from '@dailydotdev/shared/src/components/auth/common';
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
  ContentHeading,
  ContentText,
} from '../../components/layouts/ProfileLayout/common';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const socialProvider = getProviderMapClone();
socialProvider.gitHub.style = { backgroundColor: '#383C47' };
socialProvider.apple.style = { backgroundColor: '#404551' };
const providers = Object.values(socialProvider);

const AccountSecurityPage = (): ReactElement => {
  const { user } = useContext(AuthContext);
  const [email, setEmail] = useState<string>();

  if (!user) {
    return null;
  }

  const onDelete = () => {};

  return (
    <AccountPageContainer title="Security">
      <ContentHeading>Account email</ContentHeading>
      <ContentText className="mt-1">
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
      <Button className="mt-6 w-fit btn-secondary">Change email</Button>
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
        <div className="absolute inset-0 w-full h-full opacity-24 bg-theme-color-ketchup" />
      </AccountDangerZone>
    </AccountPageContainer>
  );
};

AccountSecurityPage.getLayout = getAccountDetailsLayout;

export default AccountSecurityPage;
