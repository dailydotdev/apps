import AtIcon from '@dailydotdev/shared/src/components/icons/At';
import GitHubIcon from '@dailydotdev/shared/src/components/icons/GitHub';
import HashnodeIcon from '@dailydotdev/shared/src/components/icons/Hashnode';
import LinkIcon from '@dailydotdev/shared/src/components/icons/Link';
import TwitterIcon from '@dailydotdev/shared/src/components/icons/Twitter';
import UserIcon from '@dailydotdev/shared/src/components/icons/User';
import React, { ReactElement } from 'react';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import {
  AccountContentHeading,
  AccountPageContainer,
  AccountTextField,
  ContentHeading,
  ContentText,
} from '../../components/layouts/AccountLayout/common';

const AccountProfilePage = (): ReactElement => {
  return (
    <AccountPageContainer title="Profile">
      <ContentHeading>Profile Picture</ContentHeading>
      <ContentText>
        Upload a picture to make your profile stand out and let people recognise
        your comments and contributions easily!
      </ContentText>
      {/* ImageInput component from auth ui PR */}
      <AccountContentHeading>Account information</AccountContentHeading>
      <AccountTextField
        label="Full Name"
        inputId="fullname"
        leftIcon={<UserIcon />}
      />
      <AccountTextField
        label="Username"
        inputId="username"
        leftIcon={<AtIcon />}
      />
      <AccountContentHeading>About</AccountContentHeading>
      <AccountTextField aria-multiline label="Bio" inputId="bio" />
      <AccountTextField label="Company" inputId="company" />
      <AccountTextField label="Job Title" inputId="job" />
      <AccountContentHeading>Profile Social Links</AccountContentHeading>
      <ContentText>
        Add your social media profiles so others can connect with you and you
        can grow your network!
      </ContentText>
      <AccountTextField
        leftIcon={<TwitterIcon />}
        label="Twitter"
        inputId="twitter"
      />
      <AccountTextField
        leftIcon={<GitHubIcon />}
        label="GitHub"
        inputId="github"
      />
      <AccountTextField
        leftIcon={<HashnodeIcon />}
        label="Hashnode"
        inputId="hashnode"
      />
      <AccountTextField
        leftIcon={<LinkIcon />}
        label="Your Website"
        inputId="website"
      />
    </AccountPageContainer>
  );
};

AccountProfilePage.getLayout = getAccountLayout;

export default AccountProfilePage;
