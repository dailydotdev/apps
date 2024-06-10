import ImageInput from '@dailydotdev/shared/src/components/fields/ImageInput';
import {
  AtIcon,
  GitHubIcon,
  LinkIcon,
  TwitterIcon,
  UserIcon,
  CameraIcon,
} from '@dailydotdev/shared/src/components/icons';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import {
  Button,
  ButtonColor,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import React, {
  ReactElement,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import useProfileForm, {
  UpdateProfileParameters,
} from '@dailydotdev/shared/src/hooks/useProfileForm';
import Textarea from '@dailydotdev/shared/src/components/fields/Textarea';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { useMutation } from '@tanstack/react-query';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import request from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import { UPLOAD_COVER_MUTATION } from '@dailydotdev/shared/src/graphql/users';
import { ResponseError } from '@dailydotdev/shared/src/graphql/common';
import { FormWrapper } from '@dailydotdev/shared/src/components/fields/form';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { useRouter } from 'next/router';
import ExperienceLevelDropdown from '@dailydotdev/shared/src/components/profile/ExperienceLevelDropdown';
import { TimezoneDropdown } from '@dailydotdev/shared/src/components/widgets/TimezoneDropdown';
import { getUserInitialTimezone } from '@dailydotdev/shared/src/lib/timezones';
import { AccountTextField } from '../../components/layouts/AccountLayout/common';
import { AccountPageContainer } from '../../components/layouts/AccountLayout/AccountPageContainer';
import AccountContentSection from '../../components/layouts/AccountLayout/AccountContentSection';
import { getAccountLayout } from '../../components/layouts/AccountLayout';

const imageId = 'avatar_file';
const coverId = 'cover_file';

const AccountProfilePage = (): ReactElement => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>();
  const { displayToast } = useToastNotification();
  const onSuccess = () => displayToast('Profile updated');
  const { updateUserProfile, isLoading, hint } = useProfileForm({ onSuccess });
  const { user, updateUser } = useContext(AuthContext);
  const [coverImage, setCoverImage] = useState<string>(user.cover);
  const currentCoverImage = coverImage || user.cover;
  const isMobile = useViewSize(ViewSize.MobileL);
  const [userTimeZone, setUserTimeZone] = useState<string>(
    getUserInitialTimezone({
      userTimezone: user?.timezone,
      update: true,
    }),
  );

  const onSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    const values = formToJson<UpdateProfileParameters>(formRef.current);
    const params = {
      name: values.name,
      username: values.username,
      bio: values.bio,
      company: values.company,
      title: values.title,
      twitter: values.twitter,
      github: values.github,
      portfolio: values.portfolio,
      experienceLevel: values.experienceLevel,
    };
    updateUserProfile(params);
    router.push(`/${values.username}`);
  };

  const { mutate: uploadCoverImage } = useMutation<
    { user: LoggedUser },
    ResponseError,
    { image: File }
  >(
    ({ image }) =>
      request(graphqlUrl, UPLOAD_COVER_MUTATION, {
        upload: image,
      }),
    {
      onSuccess: async (res) => {
        await updateUser({ ...user, cover: res.user.cover });
        displayToast('Cover image updated');
      },
      onError: (err) => {
        if (!err?.response?.errors?.length) {
          return;
        }
        displayToast(err.response.errors[0].message);
      },
    },
  );

  const onImageInputChange = useCallback(
    (file: File, fileName?: string, isCover = false) => {
      if (isCover) {
        setCoverImage(fileName);
      }

      if (!file) {
        return;
      }

      if (isCover) {
        uploadCoverImage({
          image: file,
        });
      } else {
        updateUserProfile({
          image: file,
        });
      }
    },
    [updateUserProfile, uploadCoverImage],
  );

  const CoverHoverIcon = () => (
    <span className="text-theme-label-secondary ml-26 mr-3 flex flex-wrap items-center justify-center">
      <CameraIcon size={IconSize.Large} />
      <span className="ml-1.5 font-bold typo-callout">Upload cover image</span>
    </span>
  );

  const RenderForm = () => (
    <form ref={formRef} id="submit-profile">
      <AccountContentSection
        className={{ heading: 'mt-0' }}
        title="Profile Picture"
        description="Upload a picture to make your profile stand out and let people recognize
        your comments and contributions easily!"
      >
        <div className="relative mt-6 flex">
          <ImageInput
            id={imageId}
            className={{
              img: 'object-cover',
              container: 'border-4 !border-background-default',
            }}
            initialValue={user.image}
            hoverIcon={<CameraIcon size={IconSize.Large} />}
            onChange={(_, file) => onImageInputChange(file)}
          />
          <ImageInput
            id={coverId}
            className={{
              root: 'absolute left-0 top-0 flex w-full',
              container:
                'border-0 bg-background-subtle hover:bg-accent-pepper-subtlest',
              img: 'object-cover',
            }}
            size="cover"
            initialValue={currentCoverImage}
            fallbackImage={null}
            alwaysShowHover={!currentCoverImage}
            hoverIcon={<CoverHoverIcon />}
            fileSizeLimitMB={5}
            onChange={(fileName, file) =>
              onImageInputChange(file, fileName, true)
            }
          />
        </div>
      </AccountContentSection>
      <AccountContentSection title="Account Information">
        <AccountTextField
          label="Name"
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
        <ExperienceLevelDropdown
          defaultValue={user.experienceLevel}
          name="experienceLevel"
          className={{
            container: 'mt-6 max-w-sm tablet:relative',
            button:
              'hover:shadow-[inset_0.125rem_0_0_var(--theme-text-primary)]',
            menu: 'absolute !left-0 !right-0 !top-[3.5rem] transform-none',
          }}
        />
      </AccountContentSection>
      <AccountContentSection title="About">
        <Textarea
          label="Bio"
          inputId="bio"
          name="bio"
          rows={5}
          value={user.bio}
          className={{ container: 'mt-6 max-w-sm' }}
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
      <AccountContentSection title="Your timezone">
        <TimezoneDropdown
          userTimeZone={userTimeZone}
          setUserTimeZone={setUserTimeZone}
        />
      </AccountContentSection>
      <AccountContentSection
        title="Profile Social Links"
        description="Add your social media profiles so others can connect with you and you
        can grow your network!"
      >
        <AccountTextField
          leftIcon={<TwitterIcon />}
          label="X"
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
  );

  if (isMobile) {
    return (
      <FormWrapper
        className={{ container: 'relative max-w-[100vw]' }}
        title="Edit Profile"
        form="submit-profile"
        rightButtonProps={{ onClick: onSubmit, disabled: isLoading }}
        leftButtonProps={{
          onClick: () => {
            router.push(user.permalink);
          },
        }}
      >
        <div className="p-4">
          <RenderForm />
        </div>
      </FormWrapper>
    );
  }

  return (
    <AccountPageContainer
      title="Profile"
      footer={
        <Button
          className="ml-auto"
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          onClick={onSubmit}
          disabled={isLoading}
        >
          Save Changes
        </Button>
      }
    >
      <RenderForm />
    </AccountPageContainer>
  );
};

AccountProfilePage.getLayout = getAccountLayout;

export default AccountProfilePage;
