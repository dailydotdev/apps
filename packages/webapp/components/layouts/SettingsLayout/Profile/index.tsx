import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { ReactElement } from 'react';
import React, { useCallback, useContext, useRef, useState } from 'react';
import ControlledTextField from '@dailydotdev/shared/src/components/fields/ControlledTextField';
import ControlledTextarea from '@dailydotdev/shared/src/components/fields/ControlledTextarea';
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
  TerminalIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  useToastNotification,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import useProfileForm from '@dailydotdev/shared/src/hooks/useProfileForm';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
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
import type { FieldValues } from 'react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';
import classed from '@dailydotdev/shared/src/lib/classed';
import ExperienceSelect from '@dailydotdev/shared/src/components/profile/ExperienceSelect';
import { HorizontalSeparator } from '@dailydotdev/shared/src/components/utilities';
import ControlledMarkdownInput from '@dailydotdev/shared/src/components/fields/MarkdownInput/ControlledMarkdownInput';
import AccountContentSection from '../AccountContentSection';
import { AccountPageContainer } from '../AccountPageContainer';
import type { VerifiedCompanyBadgeSectionProps } from './VerifiedCompanyBadge/VerifiedCompanyBadgeSection';

const Section = classed('section', 'flex flex-col gap-7');

const imageId = 'avatar_file';
const coverId = 'cover_file';

const ProfileIndex = ({
  ...props
}: VerifiedCompanyBadgeSectionProps): ReactElement => {
  const hookForm = useForm();
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

  // const onSubmit = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   const values = formToJson<UpdateProfileParameters>(formRef.current);
  //   const params = {
  //     name: values.name,
  //     username: values.username,
  //     bio: values.bio,
  //     company: values.company,
  //     title: values.title,
  //     twitter: values.twitter,
  //     github: values.github,
  //     portfolio: values.portfolio ? withHttps(values.portfolio) : null,
  //     roadmap: values.roadmap,
  //     threads: values.threads,
  //     codepen: values.codepen,
  //     reddit: values.reddit,
  //     stackoverflow: values.stackoverflow,
  //     youtube: values.youtube,
  //     linkedin: values.linkedin,
  //     mastodon: values.mastodon ? withHttps(values.mastodon) : null,
  //     bluesky: values.bluesky,
  //     experienceLevel: values.experienceLevel,
  //     onUpdateSuccess: () =>
  //       router.push(`/${values.username.toLowerCase()}`).then(() => {
  //         router.reload();
  //       }),
  //   };
  //   updateUserProfile(params);
  // };

  const onSubmit = (data: FieldValues) => {
    console.log('field values', data);
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

  return (
    <FormProvider {...hookForm}>
      <form className="flex flex-1" onSubmit={hookForm.handleSubmit(onSubmit)}>
        <AccountPageContainer
          title="Profile"
          actions={
            <>
              <Button
                type="submit"
                className="ml-auto"
                variant={ButtonVariant.Primary}
                size={ButtonSize.Small}
                disabled={isLoading}
              >
                Save
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-6">
            <Section>
              <ControlledTextField
                name="name"
                label="Full Name"
                leftIcon={<UserIcon />}
              />
              <ControlledTextField
                name="username"
                label="Username"
                leftIcon={<AtIcon />}
              />
              <ControlledTextarea name="bio" label="Headline*" />
              <ExperienceSelect
                icon={<TerminalIcon />}
                name="experienceLevel"
                placeholder="Experience Level"
              />
            </Section>
            <HorizontalSeparator />
            <Section>
              <div>
                <Typography type={TypographyType.Body} bold>
                  Verified company badge
                </Typography>
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                >
                  Verify your work email and get a verified company badge on
                  your profile. We won’t require any ID or personal information,
                  just a verification code to complete the process.
                </Typography>
              </div>
            </Section>
            <HorizontalSeparator />
            <Section>
              <div>
                <Typography type={TypographyType.Body} bold>
                  About me
                </Typography>
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                >
                  Write a short introduction that highlights who you are.
                </Typography>
              </div>
              <ControlledMarkdownInput
                name="readme"
                textareaProps={{ rows: 10 }}
              />
            </Section>
            <HorizontalSeparator />
            <Section>
              <div>
                <Typography type={TypographyType.Body} bold>
                  Profile Social Links
                </Typography>
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                >
                  Add your social media profiles so others can connect with you
                  and you can grow your network!
                </Typography>
              </div>
              <ControlledTextField
                name="github"
                label="GitHub"
                leftIcon={<GitHubIcon />}
                placeholder="Username or URL"
              />
              <ControlledTextField
                name="linkedin"
                label="LinkedIn"
                leftIcon={<LinkedInIcon />}
                placeholder="Username or URL"
              />
              <ControlledTextField
                name="portfolio"
                label="Your Website"
                leftIcon={<LinkIcon />}
                placeholder="example.com"
              />
              <ControlledTextField
                name="twitter"
                label="X"
                leftIcon={<TwitterIcon />}
                placeholder="Handle or URL"
              />
              <ControlledTextField
                name="youtube"
                label="YouTube"
                leftIcon={<YoutubeIcon />}
                placeholder="Username or URL"
              />
              <ControlledTextField
                name="stackoverflow"
                label="Stack Overflow"
                leftIcon={<StackOverflowIcon />}
                placeholder="stackoverflow.com/users/999999/username"
              />
              <ControlledTextField
                name="reddit"
                label="Reddit"
                leftIcon={<RedditIcon />}
                placeholder="Username or URL"
              />
              <ControlledTextField
                name="roadmap"
                label="Roadmap.sh"
                leftIcon={<RoadmapIcon />}
                placeholder="Username or URL"
              />
              <ControlledTextField
                name="codepen"
                label="CodePen"
                leftIcon={<CodePenIcon />}
                placeholder="Username or URL"
              />
              <ControlledTextField
                name="mastodon"
                label="Mastodon"
                leftIcon={<MastodonIcon />}
                placeholder="mastodon.social/@username"
              />
              <ControlledTextField
                name="bluesky"
                label="Bluesky"
                leftIcon={<BlueskyIcon />}
                placeholder="bsky.app/profile/username"
              />
              <ControlledTextField
                name="threads"
                label="Threads"
                leftIcon={<ThreadsIcon />}
                placeholder="Handle or URL"
              />
            </Section>
          </div>
        </AccountPageContainer>
      </form>
    </FormProvider>
  );
};
export default ProfileIndex;
