import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import ControlledTextField from '@dailydotdev/shared/src/components/fields/ControlledTextField';
import ControlledTextarea from '@dailydotdev/shared/src/components/fields/ControlledTextarea';
import {
  AtIcon,
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
  PlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  useToastNotification,
  useActions,
} from '@dailydotdev/shared/src/hooks';
import type { ProfileFormHint } from '@dailydotdev/shared/src/hooks/useProfileForm';
import useProfileForm from '@dailydotdev/shared/src/hooks/useProfileForm';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';

import { useRouter } from 'next/router';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import type { FieldValues } from 'react-hook-form';
import { FormProvider } from 'react-hook-form';
import classed from '@dailydotdev/shared/src/lib/classed';
import ExperienceSelect from '@dailydotdev/shared/src/components/profile/ExperienceSelect';
import { HorizontalSeparator } from '@dailydotdev/shared/src/components/utilities';
import ControlledMarkdownInput from '@dailydotdev/shared/src/components/fields/MarkdownInput/ControlledMarkdownInput';
import ProfileLocation from '@dailydotdev/shared/src/components/profile/ProfileLocation';
import ControlledAvatarUpload from '@dailydotdev/shared/src/components/profile/ControlledAvatarUpload';
import ControlledCoverUpload from '@dailydotdev/shared/src/components/profile/ControlledCoverUpload';
import type { UserProfile } from '@dailydotdev/shared/src/lib/user';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import useHookForm from '@dailydotdev/shared/src/hooks/useHookForm';
import { locationProfileImage } from '@dailydotdev/shared/src/lib/image';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { getCompletionItems } from '@dailydotdev/shared/src/features/profile/components/ProfileWidgets/ProfileCompletion';
import { AccountPageContainer } from '../AccountPageContainer';

const Section = classed('section', 'flex flex-col gap-7');

const ProfileIndex = (): ReactElement => {
  const { user } = useContext(AuthContext);
  const { methods: hookForm } = useHookForm({
    defaultValues: {
      name: user?.name,
      username: user?.username,
      image: user?.image,
      cover: user?.cover,
      bio: user?.bio,
      github: user?.github,
      locationId: user?.location?.id,
      linkedin: user?.linkedin,
      portfolio: user?.portfolio,
      twitter: user?.twitter,
      youtube: user?.youtube,
      stackoverflow: user?.stackoverflow,
      reddit: user?.reddit,
      roadmap: user?.roadmap,
      codepen: user?.codepen,
      mastodon: user?.mastodon,
      bluesky: user?.bluesky,
      threads: user?.threads,
      experienceLevel: user?.experienceLevel,
      readme: user?.readme || '',
    },
  });
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { completeAction, checkHasCompleted, isActionsFetched } = useActions();

  const onSuccess = () => {
    const formData = hookForm.getValues();
    const completionItems = getCompletionItems(formData);
    const isProfileComplete = completionItems.every((item) => item.completed);
    const hasCompletedAction =
      isActionsFetched && checkHasCompleted(ActionType.ProfileCompleted);

    if (isProfileComplete && !hasCompletedAction) {
      displayToast(
        'Your profile has been completed successfully. All your details are now up to date 🎉',
      );
      completeAction(ActionType.ProfileCompleted);
    } else {
      displayToast('Profile updated');
    }

    logEvent({ event_name: LogEvent.UpdateProfile });
  };
  const { updateUserProfile, isLoading } = useProfileForm({ onSuccess });

  const onSubmit = async (data: FieldValues) => {
    hookForm.clearErrors();
    updateUserProfile(data, {
      onSuccess: () => {
        router.push(`/${data.username.toLowerCase()}`).then(() => {
          router.reload();
        });
      },
      onError: (error) => {
        const errData: ProfileFormHint = JSON.parse(
          error.response.errors[0].message,
        );

        Object.entries(errData).forEach(([key, value]) => {
          hookForm.setError(key as keyof UserProfile, {
            type: 'manual',
            message: value,
          });
        });
      },
    });
  };
  return (
    <FormProvider {...hookForm}>
      <form className="flex flex-1" onSubmit={hookForm.handleSubmit(onSubmit)}>
        <AccountPageContainer
          title="Profile"
          actions={
            <Button
              type="submit"
              className="ml-auto"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              disabled={isLoading}
            >
              Save
            </Button>
          }
        >
          <div className="flex flex-col gap-6">
            <div className="relative mb-10">
              <ControlledCoverUpload
                name="coverUpload"
                currentImageName="cover"
                fileSizeLimitMB={1}
              />
              <div className="absolute bottom-0 left-6 translate-y-1/2">
                <ControlledAvatarUpload
                  name="upload"
                  currentImageName="image"
                  fileSizeLimitMB={1}
                />
              </div>
            </div>

            <Section className="mt-6">
              <ControlledTextField
                name="name"
                label="Name"
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
              <div className="flex justify-between gap-6">
                <div className="flex flex-1 flex-col flex-wrap gap-1">
                  <Typography type={TypographyType.Body} bold>
                    Verified company badge
                  </Typography>
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Secondary}
                  >
                    Add your current work location to keep your profile up to
                    date and reflect where you&apos;re based
                  </Typography>
                </div>
                <Image
                  src={locationProfileImage}
                  alt="Location"
                  loading="lazy"
                  className="h-16 w-16"
                />
                {/* TODO: Verify this is the actual page path */}
              </div>
              <Link href={`${webappUrl}/settings/experience`}>
                <span className="flex cursor-pointer items-center gap-1 text-text-link">
                  <PlusIcon />
                  Add company badge
                </span>
              </Link>
              {/* TODO: Implement company badge from experience when implemented */}
              <ProfileLocation
                locationName="locationId"
                defaultValue={user?.location}
              />
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
