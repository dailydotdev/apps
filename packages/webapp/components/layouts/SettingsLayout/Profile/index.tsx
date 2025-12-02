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
} from '@dailydotdev/shared/src/components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { FormProvider } from 'react-hook-form';
import classed from '@dailydotdev/shared/src/lib/classed';
import ExperienceSelect from '@dailydotdev/shared/src/components/profile/ExperienceSelect';
import { HorizontalSeparator } from '@dailydotdev/shared/src/components/utilities';
import ControlledMarkdownInput from '@dailydotdev/shared/src/components/fields/MarkdownInput/ControlledMarkdownInput';
import ProfileLocation from '@dailydotdev/shared/src/components/profile/ProfileLocation';
import ControlledAvatarUpload from '@dailydotdev/shared/src/components/profile/ControlledAvatarUpload';
import ControlledCoverUpload from '@dailydotdev/shared/src/components/profile/ControlledCoverUpload';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import useUserInfoForm from '@dailydotdev/shared/src/hooks/useUserInfoForm';
import ControlledSwitch from '@dailydotdev/shared/src/components/fields/ControlledSwitch';
import { AccountPageContainer } from '../AccountPageContainer';

const Section = classed('section', 'flex flex-col gap-7');

const ProfileIndex = (): ReactElement => {
  const { user } = useContext(AuthContext);
  const { methods, save, isLoading } = useUserInfoForm();

  const handleSubmit = methods.handleSubmit(() => save());
  return (
    <FormProvider {...methods}>
      <form className="flex flex-1" onSubmit={handleSubmit}>
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
              <ControlledSwitch
                name="hideExperience"
                label="Hide experience"
                description="Toggle whether your experience should be visible on your profile"
              />
            </Section>
            <HorizontalSeparator />
            <Section>
              <ProfileLocation
                locationName="externalLocationId"
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
