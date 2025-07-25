import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { ReactElement } from 'react';
import React, { useCallback, useContext, useRef, useState } from 'react';
import {
  AtIcon,
  CameraIcon,
  CodePenIcon,
  GitHubIcon,
  LinkedInIcon,
  LinkIcon,
  MastodonIcon,
  BlueskyIcon,
  RedditIcon,
  RoadmapIcon,
  StackOverflowIcon,
  ThreadsIcon,
  TwitterIcon,
  UserIcon,
  YoutubeIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import ImageInput from '@dailydotdev/shared/src/components/fields/ImageInput';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import ExperienceLevelDropdown from '@dailydotdev/shared/src/components/profile/ExperienceLevelDropdown';
import Textarea from '@dailydotdev/shared/src/components/fields/Textarea';
import { withHttps, withPrefix } from '@dailydotdev/shared/src/lib';
import { FormWrapper } from '@dailydotdev/shared/src/components/fields/form';
import {
  useToastNotification,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import type { UpdateProfileParameters } from '@dailydotdev/shared/src/hooks/useProfileForm';
import useProfileForm from '@dailydotdev/shared/src/hooks/useProfileForm';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import { useMutation } from '@tanstack/react-query';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { ResponseError } from '@dailydotdev/shared/src/graphql/common';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  clearImage,
  UPLOAD_COVER_MUTATION,
  UploadPreset,
} from '@dailydotdev/shared/src/graphql/users';
import { useRouter } from 'next/router';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { DragDrop } from '@dailydotdev/shared/src/components/fields/DragDrop';
import { FeelingLazy } from '@dailydotdev/shared/src/features/profile/components/FeelingLazy';
import {
  fileValidation,
  useUploadCv,
} from '@dailydotdev/shared/src/features/profile/hooks/useUploadCv';
import ConditionalWrapper from '@dailydotdev/shared/src/components/ConditionalWrapper';
import { AccountTextField } from '../common';
import AccountContentSection from '../AccountContentSection';
import { AccountPageContainer } from '../AccountPageContainer';
import { VerifiedCompanyBadgeSection } from './VerifiedCompanyBadge/VerifiedCompanyBadgeSection';
import type { VerifiedCompanyBadgeSectionProps } from './VerifiedCompanyBadge/VerifiedCompanyBadgeSection';

const imageId = 'avatar_file';
const coverId = 'cover_file';

const ProfileIndex = ({
  ...props
}: VerifiedCompanyBadgeSectionProps): ReactElement => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const onSuccess = () => {
    displayToast('Profile updated');
    logEvent({ event_name: LogEvent.UpdateProfile });
  };
  const { updateUserProfile, isLoading, hint } = useProfileForm({ onSuccess });
  const { user, updateUser } = useContext(AuthContext);
  const [coverImage, setCoverImage] = useState(user?.cover);
  const currentCoverImage = coverImage || user?.cover;
  const isMobile = useViewSize(ViewSize.MobileL);

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
      portfolio: values.portfolio ? withHttps(values.portfolio) : null,
      roadmap: values.roadmap,
      threads: values.threads,
      codepen: values.codepen,
      reddit: values.reddit,
      stackoverflow: values.stackoverflow,
      youtube: values.youtube,
      linkedin: values.linkedin,
      mastodon: values.mastodon ? withHttps(values.mastodon) : null,
      bluesky: values.bluesky,
      experienceLevel: values.experienceLevel,
      onUpdateSuccess: () =>
        router.push(`/${values.username.toLowerCase()}`).then(() => {
          router.reload();
        }),
    };
    updateUserProfile(params);
  };

  const { mutate: uploadCoverImage } = useMutation<
    { user: LoggedUser },
    ResponseError,
    { image: File }
  >({
    mutationFn: ({ image }) =>
      gqlClient.request(UPLOAD_COVER_MUTATION, {
        upload: image,
      }),

    onSuccess: async (res) => {
      await updateUser({ ...user, cover: res.user.cover } as LoggedUser);
      displayToast('Cover image updated');
    },

    onError: (err) => {
      if (!err?.response?.errors?.length) {
        return;
      }
      displayToast(err.response.errors[0].message);
    },
  });

  const { mutateAsync: clearImageMutation } = useMutation({
    mutationFn: clearImage,
  });

  const onImageInputChange = useCallback(
    (file?: File, fileName?: string, isCover = false) => {
      if (!file) {
        return clearImageMutation([
          isCover ? UploadPreset.ProfileCover : UploadPreset.Avatar,
        ]);
      }

      if (isCover) {
        setCoverImage(fileName);
        uploadCoverImage({
          image: file,
        });
      } else {
        logEvent({ event_name: LogEvent.UpdateProfileImage });
        updateUserProfile({
          image: file,
        });
      }

      return undefined;
    },
    [updateUserProfile, uploadCoverImage, clearImageMutation, logEvent],
  );

  const CoverHoverIcon = () => (
    <span className="text-theme-label-secondary ml-26 mr-3 flex flex-wrap items-center justify-center">
      <CameraIcon size={IconSize.Large} />
      <span className="ml-1.5 font-bold typo-callout">Upload cover image</span>
    </span>
  );

  const { onUpload, status, shouldShow } = useUploadCv();

  const uploadSection = (
    <AccountContentSection
      className={{ heading: 'mt-0' }}
      title="Your next job should apply to you"
      description="Upload your CV so we can quietly start matching you with roles that actually fit your skills and interests. Nothing is ever shared without your permission, and we’ll only reach out when there’s something genuinely worth your time. No spam, no pressure."
    >
      <DragDrop
        className="my-4 max-w-80"
        onFilesDrop={([file]) => onUpload(file)}
        validation={fileValidation}
        state={status}
      />
      {!user?.flags?.cvUploadedAt ? (
        <FeelingLazy />
      ) : (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          Tip: Complete your profile below to improve match quality
        </Typography>
      )}
    </AccountContentSection>
  );

  const form = (
    <ConditionalWrapper
      condition={shouldShow}
      wrapper={(component) => (
        <>
          {uploadSection}
          {component}
        </>
      )}
    >
      <form ref={formRef} id="submit-profile">
        <AccountContentSection
          className={{ heading: !shouldShow ? 'mt-0' : undefined }}
          title="Profile Picture"
          description="Upload a picture to make your profile stand out and let people recognize
        your comments and contributions easily!"
        >
          <div className="relative mt-6 flex">
            <div className="absolute left-0 top-0 flex w-full max-w-[19.25rem]">
              <ImageInput
                id={coverId}
                className={{
                  root: 'w-full',
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
                closeable
              />
            </div>
            <ImageInput
              id={imageId}
              className={{
                img: 'object-cover',
                container:
                  'border-4 !border-background-default bg-background-subtle hover:bg-accent-pepper-subtlest',
              }}
              initialValue={user?.image}
              alwaysShowHover={!user?.image}
              hoverIcon={<CameraIcon size={IconSize.Large} />}
              onChange={(_, file) => onImageInputChange(file)}
              closeable
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
            value={user?.name}
          />
          <AccountTextField
            label="Username"
            inputId="username"
            hint={hint.username}
            valid={!hint.username}
            name="username"
            leftIcon={<AtIcon />}
            value={user?.username}
          />
          <ExperienceLevelDropdown
            defaultValue={user?.experienceLevel}
            name="experienceLevel"
            className={{
              container: 'mt-6 max-w-sm tablet:relative',
              button:
                'hover:shadow-[inset_0.125rem_0_0_var(--theme-text-primary)]',
              menu: 'absolute !left-0 !right-0 !top-[3.5rem] transform-none',
            }}
          />
        </AccountContentSection>
        <VerifiedCompanyBadgeSection {...props} />
        <AccountContentSection title="About">
          <Textarea
            label="Bio"
            inputId="bio"
            name="bio"
            rows={5}
            value={user?.bio}
            className={{ container: 'mt-6 max-w-sm' }}
          />
          <AccountTextField
            label="Company"
            inputId="company"
            name="company"
            value={user?.company}
          />
          <AccountTextField
            label="Job Title"
            inputId="title"
            name="title"
            value={user?.title}
          />
        </AccountContentSection>
        <AccountContentSection
          title="Profile Social Links"
          description="Add your social media profiles so others can connect with you and you
        can grow your network!"
        >
          <AccountTextField
            leftIcon={<GitHubIcon />}
            label="GitHub"
            inputId="github"
            hint={hint.github}
            valid={!hint.github}
            name="github"
            value={user?.github}
            placeholder="Username or URL"
          />
          <AccountTextField
            leftIcon={<LinkedInIcon />}
            label="LinkedIn"
            inputId="linkedin"
            hint={hint.linkedin}
            valid={!hint.linkedin}
            name="linkedin"
            value={user?.linkedin}
            placeholder="Username or URL"
          />
          <AccountTextField
            leftIcon={<LinkIcon />}
            label="Your Website"
            inputId="portfolio"
            hint={hint.portfolio}
            valid={!hint.portfolio}
            name="portfolio"
            value={user?.portfolio}
            placeholder="example.com"
          />
          <AccountTextField
            leftIcon={<TwitterIcon />}
            label="X"
            inputId="twitter"
            hint={hint.twitter}
            valid={!hint.twitter}
            name="twitter"
            value={user?.twitter}
            placeholder="Handle or URL"
          />
          <AccountTextField
            leftIcon={<YoutubeIcon />}
            label="YouTube"
            inputId="youtube"
            hint={hint.youtube}
            valid={!hint.youtube}
            name="youtube"
            value={user?.youtube}
            placeholder="Username or URL"
          />
          <AccountTextField
            leftIcon={<StackOverflowIcon />}
            label="Stack Overflow"
            inputId="stackoverflow"
            hint={hint.stackoverflow}
            valid={!hint.stackoverflow}
            name="stackoverflow"
            value={withPrefix('stackoverflow.com/users/', user?.stackoverflow)}
            placeholder="stackoverflow.com/users/999999/username"
          />
          <AccountTextField
            leftIcon={<RedditIcon />}
            label="Reddit"
            inputId="reddit"
            hint={hint.reddit}
            valid={!hint.reddit}
            name="reddit"
            value={user?.reddit}
            placeholder="Username or URL"
          />
          <AccountTextField
            leftIcon={<RoadmapIcon />}
            label="Roadmap.sh"
            inputId="roadmap"
            hint={hint.roadmap}
            valid={!hint.roadmap}
            name="roadmap"
            value={user?.roadmap}
            placeholder="Username or URL"
          />
          <AccountTextField
            leftIcon={<CodePenIcon />}
            label="CodePen"
            inputId="codepen"
            hint={hint.codepen}
            valid={!hint.codepen}
            name="codepen"
            value={user?.codepen}
            placeholder="Username or URL"
          />
          <AccountTextField
            leftIcon={<MastodonIcon />}
            label="Mastodon"
            inputId="mastodon"
            hint={hint.mastodon}
            valid={!hint.mastodon}
            name="mastodon"
            value={user?.mastodon}
            placeholder="mastodon.social/@username"
          />
          <AccountTextField
            leftIcon={<BlueskyIcon />}
            label="Bluesky"
            inputId="bluesky"
            hint={hint.bluesky}
            valid={!hint.bluesky}
            name="bluesky"
            value={user?.bluesky}
            placeholder="bsky.app/profile/username"
          />
          <AccountTextField
            leftIcon={<ThreadsIcon />}
            label="Threads"
            inputId="threads"
            hint={hint.threads}
            valid={!hint.threads}
            name="threads"
            value={user?.threads}
            placeholder="Handle or URL"
          />
        </AccountContentSection>
      </form>
    </ConditionalWrapper>
  );

  if (isMobile) {
    return (
      <FormWrapper
        className={{
          container: 'relative max-w-[100vw]',
          title: 'font-bold typo-title3',
        }}
        title="Edit Profile"
        form="submit-profile"
        rightButtonProps={{ onClick: onSubmit, disabled: isLoading }}
        leftButtonProps={{
          onClick: () => {
            router.push(user?.permalink ?? '/');
          },
        }}
      >
        <div className="p-4">{form}</div>
      </FormWrapper>
    );
  }

  return (
    <AccountPageContainer
      title="Profile"
      actions={
        <>
          <Button
            className="ml-auto"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            onClick={onSubmit}
            disabled={isLoading}
          >
            Save
          </Button>
        </>
      }
    >
      {form}
    </AccountPageContainer>
  );
};
export default ProfileIndex;
