import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import AtIcon from '@dailydotdev/shared/src/components/icons/At';
import GitHubIcon from '@dailydotdev/shared/src/components/icons/GitHub';
import HashnodeIcon from '@dailydotdev/shared/src/components/icons/Hashnode';
import LinkIcon from '@dailydotdev/shared/src/components/icons/Link';
import TwitterIcon from '@dailydotdev/shared/src/components/icons/Twitter';
import UserIcon from '@dailydotdev/shared/src/components/icons/User';
import classed from '@dailydotdev/shared/src/lib/classed';
import React, { ReactElement } from 'react';
import {
  getLayout as getProfileLayout,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import {
  AccountPageContainer,
  ContentHeading,
  ContentText,
} from '../../components/layouts/ProfileLayout/common';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const BaseTextField = classed(TextField, 'max-w-sm');
const CommonTextField = classed(BaseTextField, 'mt-6');
const CommonContentHeading = classed(ContentHeading, 'mt-10');

const AccountProfilePage = (): ReactElement => {
  return (
    <AccountPageContainer title="Profile">
      <ContentHeading>Profile Picture</ContentHeading>
      <ContentText className="mt-1">
        Upload a picture to make your profile stand out and let people recognise
        your comments and contributions easily!
      </ContentText>
      {/* ImageInput component from auth ui PR */}
      <CommonContentHeading>Account information</CommonContentHeading>
      <BaseTextField
        label="Full Name"
        inputId="fullname"
        leftIcon={<UserIcon />}
      />
      <CommonTextField
        label="Username"
        inputId="username"
        leftIcon={<AtIcon />}
      />
      <CommonContentHeading>About</CommonContentHeading>
      <CommonTextField aria-multiline label="Bio" inputId="bio" />
      <CommonTextField label="Company" inputId="company" />
      <CommonTextField label="Job Title" inputId="job" />
      <CommonContentHeading>Profile Social Links</CommonContentHeading>
      <ContentText>
        Add your social media profiles so others can connect with you and you
        can grow your network!
      </ContentText>
      <CommonTextField
        leftIcon={<TwitterIcon />}
        label="Twitter"
        inputId="twitter"
      />
      <CommonTextField
        leftIcon={<GitHubIcon />}
        label="GitHub"
        inputId="github"
      />
      <CommonTextField
        leftIcon={<HashnodeIcon />}
        label="Hashnode"
        inputId="hashnode"
      />
      <CommonTextField
        leftIcon={<LinkIcon />}
        label="Your Website"
        inputId="website"
      />
    </AccountPageContainer>
  );
};

AccountProfilePage.getLayout = getProfileLayout;

export default AccountProfilePage;
