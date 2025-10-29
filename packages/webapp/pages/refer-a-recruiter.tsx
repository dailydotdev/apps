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

import {
  recruiterSpamCampaign,
  recruiterSpamCampaignSEO,
} from '@dailydotdev/shared/src/lib/image';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';

import { Image } from '@dailydotdev/shared/src/components/image/Image';
import {
  AppIcon,
  ClickIcon,
  CoreIcon,
  DownloadIcon,
  MailIcon,
  TimerIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { defaultSeo } from '../next-seo';
import { getLayout } from '../components/layouts/NoSidebarLayout';
import ProtectedPage from '../components/ProtectedPage';
import { BackgroundImage } from './opportunity/welcome';

const seo: NextSeoProps = {
  title: 'daily.dev | Refer Recruiters - earn Cores',
  openGraph: { images: [{ url: recruiterSpamCampaignSEO }] },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

const HeaderSection = (): ReactElement => {
  return (
    <FlexCol className="items-center gap-8">
      <Typography center type={TypographyType.Mega1} bold>
        Refer a Recruiter
        <br /> Earn Cores 💰
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
          recruiter you refer, you can now earn <strong>1,000 Cores</strong>.
          They can be used to unlock features, boost your content, or simply get
          rewarded for staying awesome.
        </Typography>
      </FlexCol>
    </FlexCol>
  );
};

const howItWorksItems = [
  {
    icon: DownloadIcon,
    number: 0,
    title: 'Install the daily.dev extension',
    description: (
      <>
        Make sure you have the daily.dev browser extension installed.&nbsp;
        <a
          href="https://api.daily.dev/get"
          className="text-text-link underline"
          target="_blank"
          rel={anchorDefaultRel}
        >
          Get it here
        </a>
        .
      </>
    ),
  },
  {
    icon: AppIcon,
    number: 1,
    title: 'Enable the companion',
    description: (
      <>
        Enable the daily.dev companion to unlock recruiter referral features on
        LinkedIn.&nbsp;
        <a
          href="https://docs.daily.dev/docs/key-features/the-companion#activating-the-companion"
          className="text-text-link underline"
          target="_blank"
          rel={anchorDefaultRel}
        >
          Check out our docs
        </a>
        .
      </>
    ),
  },
  {
    icon: MailIcon,
    number: 2,
    title: 'Check your LinkedIn DMs',
    description:
      'Got a cold message from a recruiter? Perfect - that’s your ticket.',
  },
  {
    icon: ClickIcon,
    number: 3,
    title: 'Click our button to generate a response',
    description:
      'Click our button in the message to generate a pre-filled response containing your unique referral link.',
  },
  {
    icon: TimerIcon,
    number: 4,
    title: 'Wait for the recruiter to check out daily.dev Recruiter',
    description:
      'When the recruiter clicks your link and checks out daily.dev Recruiter, we log the referral.',
  },
  {
    icon: CoreIcon,
    number: 5,
    title: 'Get your free Cores',
    description: (
      <>
        Once the recruiter has been referred, you&apos;ll receive Cores directly
        in your account.
        <br /> We review applications every 14 days.
      </>
    ),
  },
];
const HowItWorksSection = (): ReactElement => {
  return (
    <FlexCol className="gap-7">
      <Typography type={TypographyType.LargeTitle} center bold>
        How it works 💡
      </Typography>
      <FlexCol className="gap-6">
        {howItWorksItems.map(({ icon: Icon, number, title, description }) => (
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
                </Typography>
              </FlexCol>
            </FlexRow>
          </div>
        ))}
      </FlexCol>

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
      'Multiple entries are allowed (up to 10) and a maximum of 10,000 Cores can be earned per user.',
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
        </FlexCol>
      </div>
    </ProtectedPage>
  );
};

RecruiterSpamPage.getLayout = getLayout;
RecruiterSpamPage.layoutProps = { screenCentered: true, seo };

export default RecruiterSpamPage;
