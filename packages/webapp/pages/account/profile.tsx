import ImageInput from '@dailydotdev/shared/src/components/fields/ImageInput';
import AtIcon from '@dailydotdev/shared/src/components/icons/At';
import GitHubIcon from '@dailydotdev/shared/src/components/icons/GitHub';
import HashnodeIcon from '@dailydotdev/shared/src/components/icons/Hashnode';
import LinkIcon from '@dailydotdev/shared/src/components/icons/Link';
import TwitterIcon from '@dailydotdev/shared/src/components/icons/Twitter';
import UserIcon from '@dailydotdev/shared/src/components/icons/User';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import React, { ReactElement, useContext } from 'react';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import AccountContentSection from '../../components/layouts/AccountLayout/AccountContentSection';
import { AccountPageContainer } from '../../components/layouts/AccountLayout/AccountPageContainer';
import { AccountTextField } from '../../components/layouts/AccountLayout/common';

const AccountProfilePage = (): ReactElement => {
  const { user } = useContext(AuthContext);

  return (
    <AccountPageContainer title="Profile">
      <AccountContentSection
        headingClassName="mt-0"
        title="Profile Picture"
        description="Upload a picture to make your profile stand out and let people recognise
        your comments and contributions easily!"
      >
        <ImageInput className="mt-6" initialValue={user.image} />
      </AccountContentSection>
      <AccountContentSection title="Account Information">
        <AccountTextField
          label="Full Name"
          inputId="fullname"
          leftIcon={<UserIcon />}
          value={user.name}
        />
        <AccountTextField
          label="Username"
          inputId="username"
          leftIcon={<AtIcon />}
          value={user.username}
        />
      </AccountContentSection>
      <AccountContentSection title="About">
        <AccountTextField
          aria-multiline
          label="Bio"
          inputId="bio"
          value={user.bio}
        />
        <AccountTextField
          label="Company"
          inputId="company"
          value={user.company}
        />
        <AccountTextField label="Job Title" inputId="job" value={user.title} />
      </AccountContentSection>
      <AccountContentSection
        title="Profile Social Links"
        description="Add your social media profiles so others can connect with you and you
        can grow your network!"
      >
        <AccountTextField
          leftIcon={<TwitterIcon />}
          label="Twitter"
          inputId="twitter"
          value={user.twitter}
        />
        <AccountTextField
          leftIcon={<GitHubIcon />}
          label="GitHub"
          inputId="github"
          value={user.github}
        />
        <AccountTextField
          leftIcon={<HashnodeIcon />}
          label="Hashnode"
          inputId="hashnode"
          value={user.hashnode}
        />
        <AccountTextField
          leftIcon={<LinkIcon />}
          label="Your Website"
          inputId="website"
          value={user.portfolio}
        />
      </AccountContentSection>
    </AccountPageContainer>
  );
};

AccountProfilePage.getLayout = getAccountLayout;

export default AccountProfilePage;
