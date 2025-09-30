import type { ReactElement } from 'react';
import React from 'react';

import type { NextSeoProps } from 'next-seo';
import {
  Divider,
  FlexCol,
  FlexRow,
} from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

import { recruiterSpamCampaign } from '@dailydotdev/shared/src/lib/image';
import { useThemedAsset } from '@dailydotdev/shared/src/hooks/utils';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';

import { Image } from '@dailydotdev/shared/src/components/image/Image';
import {
  CopyIcon,
  CoreIcon,
  MailIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { UploadIcon } from '@dailydotdev/shared/src/components/icons/Upload';
import { ButtonVariant } from '@dailydotdev/shared/src/components/buttons/common';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { useCopyText } from '@dailydotdev/shared/src/hooks/useCopy';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { defaultOpenGraph, defaultSeo, defaultSeoTitle } from '../next-seo';
import { getLayout } from '../components/layouts/NoSidebarLayout';
import ProtectedPage from '../components/ProtectedPage';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

const formLink = 'https://it057218.typeform.com/to/PoQ6GV0d';

const HeaderSection = (): ReactElement => {
  return (
    <FlexCol className="items-center gap-8">
      <Typography center type={TypographyType.Mega1} bold>
        Convert Recruiter
        <br /> Spam to Cores 💰
      </Typography>

      <Image
        className="mb-5 rounded-16"
        src={recruiterSpamCampaign}
        alt="Convert Recruiter Spam to Cores"
      />

      <FlexCol className="items-center gap-6 text-center">
        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Primary}
        >
          Every day, developers like you get bombarded by cold recruiter
          messages that are irrelevant, pushy, or just plain AI-generated.
        </Typography>
        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Primary}
        >
          At <strong>daily.dev</strong>, we want to flip the script. For every
          recruiter message you receive, you can now earn{' '}
          <strong>300 Cores</strong>. They can be used to unlock features, boost
          your content, or simply get rewarded for staying awesome.
        </Typography>
      </FlexCol>
    </FlexCol>
  );
};

const howItWorksItems = [
  {
    icon: MailIcon,
    number: 1,
    title: 'Check your LinkedIn DMs',
    description: 'Got a cold message from a recruiter? Perfect - that’s your ticket.',
  },
  {
    icon: CopyIcon,
    number: 2,
    title: 'Reply with our template',
    description: 'Copy-paste the template below (or write your own, as long as it includes the link to https://recruiter.daily.dev)',
  },
  {
    icon: UploadIcon,
    number: 3,
    title: 'Submit the evidence',
    description:
      "Upload the screenshot + recruiter profile link through this form",
    extra: true,
  },
  {
    icon: CoreIcon,
    number: 4,
    title: 'Get your free Cores',
    description: (
      <>
        Once verified, you&apos;ll receive Cores directly in your account.
        <br /> We review applications every 14 days.
      </>
    ),
  },
];
const HowItWorksSection = (): ReactElement => {
  const { user } = useAuthContext();

  const [, copyText] = useCopyText(
    "I'm currently not open to opportunities. You might find the right candidate on https://recruiter.daily.dev. It's worth checking out!",
  );

  return (
    <FlexCol className="gap-7">
      <Typography type={TypographyType.LargeTitle} center bold>
        How it works 💡
      </Typography>
      <FlexCol className="mb-12 gap-6">
        {howItWorksItems.map(
          ({ icon: Icon, number, title, description, extra }) => (
            <div
              className="shadow-sm relative flex flex-col gap-6 overflow-hidden rounded-16 border border-border-subtlest-primary bg-background-subtle p-6"
              key={number}
            >
              <FlexRow className="items-center gap-4">
                <Typography type={TypographyType.Title3} bold>
                  {number}
                </Typography>
                <Icon size={IconSize.Large} />
                <FlexCol className="flex-1">
                  <Typography type={TypographyType.Body} bold className="mb-2">
                    {title}
                  </Typography>
                  <Typography
                    type={TypographyType.Body}
                    color={TypographyColor.Tertiary}
                    className="flex flex-wrap"
                  >
                    {description}{' '}
                    {!!extra && (
                      <a
                        href={`${formLink}#user_id=${user.id}`}
                        className="ml-1 text-text-link underline"
                        target="_blank"
                        rel={anchorDefaultRel}
                      >
                        here
                      </a>
                    )}
                  </Typography>
                </FlexCol>
              </FlexRow>
            </div>
          ),
        )}
      </FlexCol>
      <div className="shadow-sm md:p-8 flex flex-col gap-6 rounded-16 border border-border-subtlest-primary bg-background-subtle p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <FlexCol className="flex-1 gap-4">
            <Typography type={TypographyType.Title3} bold>
              Pre-filled Response template
            </Typography>
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Tertiary}
            >
              Click to copy and paste into your LinkedIn reply
            </Typography>
          </FlexCol>
          <Button
            icon={<CopyIcon />}
            variant={ButtonVariant.Tertiary}
            className="ml-auto"
            onClick={() => copyText()}
          />
        </div>
        <div className="break-words rounded-14 border border-border-subtlest-primary p-4 font-mono">
          I&apos;m currently not open to opportunities. You might find the right
          candidate on https://recruiter.daily.dev. It&apos;s worth checking
          out!
        </div>
      </div>

      <FlexRow className="items-center gap-1">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="mx-auto"
        >
          Simple. Legit. Developer-first.
        </Typography>
      </FlexRow>
    </FlexCol>
  );
};

const finePrint = [
  {
    description:
      'To ensure quality, all submissions are manually reviewed (once every 14 days).',
  },
  {
    description: 'Only cold recruiter messages via LinkedIn are accepted.',
  },
  {
    description: 'Messages must be received within the last 3 months',
  },
  {
    description:
      'For now, we are only able to accept entries from developers based in the US and Europe',
  },
  {
    description:
      'Multiple entries are allowed (up to 10) and a maximum of 3,000 Cores can be earned per user.',
  },
  {
    description:
      'The screenshot you upload should provide a clear view of the message + recruiter identity.',
  },
  {
    description:
      'Developers found attempting to game the system or submit fraudulent content will be banned from future campaigns.',
  },
];
const FinePrintSection = (): ReactElement => (
  <FlexCol className="gap-7">
    <Typography type={TypographyType.LargeTitle} center bold>
      Fine print 🛡️
    </Typography>
    <div className="gap-6">
      <ul className="list ml-6 list-disc space-y-2">
        {finePrint.map(({ description }) => (
          <li key={description}>
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Primary}
            >
              {description}
            </Typography>
          </li>
        ))}
      </ul>
    </div>
  </FlexCol>
);

const GetStartedSection = (): ReactElement => {
  const { user } = useAuthContext();

  return (
    <FlexCol className="items-center gap-6">
      <Typography center type={TypographyType.Title3} bold>
        Stop deleting recruiter spam. Start farming it!
      </Typography>
      <Button
        tag="a"
        href={`${formLink}#user_id=${user.id}`}
        target="_blank"
        variant={ButtonVariant.Primary}
      >
        I want my Cores
      </Button>
    </FlexCol>
  );
};

const BackgroundImage = (): ReactElement => {
  const { jobsWelcome } = useThemedAsset();
  return (
    <img
      src={jobsWelcome}
      alt="Jobs welcome"
      className="fixed left-1/2 top-12 z-0 max-w-[60rem] -translate-x-1/2 transform laptop:top-14"
    />
  );
};

const RecruiterSpamPage = (): ReactElement => {
  const { isAuthReady } = useAuthContext();

  if (!isAuthReady) {
    return <BackgroundImage />;
  }

  return (
    <ProtectedPage>
      <BackgroundImage />
      <div className="relative mx-4 mb-20 mt-10 max-w-[47.875rem] tablet:mx-auto">
        <FlexCol className="gap-10 tablet:mx-4 laptop:mx-0">
          <HeaderSection />
          <Divider />
          <HowItWorksSection />
          <Divider />
          <FinePrintSection />
          <Divider />
          <GetStartedSection />
        </FlexCol>
      </div>
    </ProtectedPage>
  );
};

RecruiterSpamPage.getLayout = getLayout;
RecruiterSpamPage.layoutProps = { screenCentered: true, seo };

export default RecruiterSpamPage;
