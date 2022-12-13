import ImageInput from '@dailydotdev/shared/src/components/fields/ImageInput';
import AtIcon from '@dailydotdev/shared/src/components/icons/At';
import GitHubIcon from '@dailydotdev/shared/src/components/icons/GitHub';
import HashnodeIcon from '@dailydotdev/shared/src/components/icons/Hashnode';
import LinkIcon from '@dailydotdev/shared/src/components/icons/Link';
import TwitterIcon from '@dailydotdev/shared/src/components/icons/Twitter';
import UserIcon from '@dailydotdev/shared/src/components/icons/User';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import React, { ReactElement, useContext, useRef } from 'react';
import useProfileForm, {
  UpdateProfileParameters,
} from '@dailydotdev/shared/src/hooks/useProfileForm';
import CameraIcon from '@dailydotdev/shared/src/components/icons/Camera';
import Textarea from '@dailydotdev/shared/src/components/fields/Textarea';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import AccountContentSection from '../../components/layouts/AccountLayout/AccountContentSection';
import { AccountPageContainer } from '../../components/layouts/AccountLayout/AccountPageContainer';
import { AccountTextField } from '../../components/layouts/AccountLayout/common';

const id = 'avatar_file';

const AccountProfilePage = (): ReactElement => {
  const formRef = useRef<HTMLFormElement>();
  const { displayToast } = useToastNotification();
  const onSuccess = () => displayToast('Profile updated');
  const { updateUserProfile, isLoading, hint } = useProfileForm({ onSuccess });
  const { user } = useContext(AuthContext);

  const onSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    const values = formToJson<UpdateProfileParameters>(formRef.current);
    const input = document.getElementById(id) as HTMLInputElement;
    const file = input.files[0];
    const params = {
      name: values.name,
      username: values.username,
      bio: values.bio,
      company: values.company,
      title: values.title,
      twitter: values.twitter,
      github: values.github,
      hashnode: values.hashnode,
      portfolio: values.portfolio,
      image: file,
    };
    updateUserProfile(params);
  };

  return (
    <AccountPageContainer
      title="Profile"
      footer={
        <Button
          className="ml-auto btn-primary-cabbage"
          onClick={onSubmit}
          disabled={isLoading}
        >
          Save Changes
        </Button>
      }
    >
      <form ref={formRef}>
        <AccountContentSection
          className={{ heading: 'mt-0' }}
          title="Profile Picture"
          description="Upload a picture to make your profile stand out and let people recognize
        your comments and contributions easily!"
        >
          <ImageInput
            id={id}
            className={{ container: 'mt-6', img: 'object-cover' }}
            initialValue={user.image}
            hoverIcon={<CameraIcon size="xlarge" />}
          />
        </AccountContentSection>
        <AccountContentSection title="Account Information">
          <AccountTextField
            label="Full Name"
            inputId="name"
            name="name"
            hint={hint.name}
            valid={!hint.name}
            leftIcon={<UserIcon />}
            value={user.name}
          />
          <AccountTextField
            label="Username"
            inputId="username"
            hint={hint.username}
            valid={!hint.username}
            name="username"
            leftIcon={<AtIcon />}
            value={user.username}
          />
        </AccountContentSection>
        <AccountContentSection title="About">
          <Textarea
            label="Bio"
            inputId="bio"
            name="bio"
            rows={5}
            value={user.bio}
            className={{ container: 'max-w-sm mt-6' }}
          />
          <AccountTextField
            label="Company"
            inputId="company"
            name="company"
            value={user.company}
          />
          <AccountTextField
            label="Job Title"
            inputId="title"
            name="title"
            value={user.title}
          />
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
            hint={hint.twitter}
            valid={!hint.twitter}
            name="twitter"
            value={user.twitter}
          />
          <AccountTextField
            leftIcon={<GitHubIcon />}
            label="GitHub"
            inputId="github"
            hint={hint.github}
            valid={!hint.github}
            name="github"
            value={user.github}
          />
          <AccountTextField
            leftIcon={<HashnodeIcon />}
            label="Hashnode"
            inputId="hashnode"
            hint={hint.hashnode}
            valid={!hint.hashnode}
            name="hashnode"
            value={user.hashnode}
          />
          <AccountTextField
            leftIcon={<LinkIcon />}
            label="Your Website"
            inputId="portfolio"
            hint={hint.portfolio}
            valid={!hint.portfolio}
            name="portfolio"
            value={user.portfolio}
          />
        </AccountContentSection>
      </form>
    </AccountPageContainer>
  );
};

AccountProfilePage.getLayout = getAccountLayout;

export default AccountProfilePage;
