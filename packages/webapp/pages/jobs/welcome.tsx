import type { ReactElement } from 'react';
import React from 'react';

import type { NextSeoProps } from 'next-seo';
import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
import {
  DailyIcon,
  JobIcon,
  MedalBadgeIcon,
  ShieldPlusIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { briefButtonBg } from '@dailydotdev/shared/src/styles/custom';
import {
  jobsHowItWorksOne,
  jobsHowItWorksThree,
  jobsHowItWorksTwo,
} from '@dailydotdev/shared/src/lib/image';
import { Accordion } from '@dailydotdev/shared/src/components/accordion';
import { useThemedAsset } from '@dailydotdev/shared/src/hooks/utils';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { defaultOpenGraph, defaultSeo, defaultSeoTitle } from '../../next-seo';
import { getLayout } from '../../components/layouts/NoSidebarLayout';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

const HeaderSection = (): ReactElement => {
  const { user } = useAuthContext();

  return (
    <FlexCol className="items-center gap-2 text-center">
      <FlexRow className="items-center gap-1">
        <DailyIcon />{' '}
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Careeer mode unlocked (beta)
        </Typography>
      </FlexRow>
      <Typography type={TypographyType.LargeTitle} bold>
        Getting hired the old way
        <br /> is officially dead
      </Typography>
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Large}
        style={{
          background: briefButtonBg,
        }}
        className="mt-4 gap-2 border-none !px-16 text-black"
      >
        <ProfilePicture
          size={ProfileImageSize.Small}
          ref={null}
          user={user}
          nativeLazyLoading
        />
        Show me what you got →
      </Button>
      <FlexRow className="items-center gap-1">
        <VIcon className="text-accent-avocado-subtlest" />
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          <strong>100% free.</strong> Your career, your rules.
        </Typography>
      </FlexRow>
    </FlexCol>
  );
};

const benefits = [
  {
    icon: <ShieldPlusIcon secondary />,
    title: 'No more cold outreach',
    description:
      'No cold DMs from strangers. Only real roles from real teams, surfaced when it’s actually worth your time.',
  },
  {
    icon: <MedalBadgeIcon />,
    title: 'No more surprises',
    description:
      'Private by default. You review opportunities quietly, choose yes or no, and nothing moves without your OK.',
  },
  {
    icon: <JobIcon secondary />,
    title: 'No more irrelevant offers',
    description:
      'We connect you to with roles we believe would fit your skills, interests, and goals. If it isn’t a fit, you won’t see it.',
  },
];

const BenefitSection = (): ReactElement => (
  <div className="flex flex-col gap-4 text-center tablet:flex-row">
    {benefits.map(({ icon, title, description }) => (
      <FlexCol className="flex-1 items-center gap-1" key={title}>
        {icon}
        <Typography type={TypographyType.Callout} bold className="mt-1.5">
          {title}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
        >
          {description}
        </Typography>
      </FlexCol>
    ))}
  </div>
);

const howItWorks = [
  {
    image: jobsHowItWorksOne,
    title: 'Review the opportunity',
    description:
      'See the role and decide if it’s worth moving forward. No pressure and no one even knows you’ve been approached.',
  },
  {
    image: jobsHowItWorksTwo,
    title: 'We’ll check mutual interest',
    description:
      'We talk directly with the recruiter to confirm they’re genuinely interested before you invest a minute more.',
  },
  {
    image: jobsHowItWorksThree,
    title: 'We make a warm intro',
    description:
      'Only if it’s a yes on both sides do we connect you directly. Every conversation starts with intent and momentum.',
  },
];
const HowItWorksSection = (): ReactElement => (
  <FlexCol className="gap-7 text-center">
    <Typography type={TypographyType.Title3} bold>
      How it works
    </Typography>
    <div className="flex flex-col gap-4 text-left tablet:flex-row">
      {howItWorks.map(({ image, title, description }, index) => (
        <div
          className="flex flex-1 flex-row gap-4 tablet:flex-col tablet:gap-1"
          key={title}
        >
          <div className="relative mb-3">
            <img
              src={image}
              alt={title}
              className="h-24 w-24 rounded-16 object-cover tablet:w-full"
            />
            <div className="absolute bottom-[0.625rem] left-[0.625rem] size-[1.875rem] rounded-10 bg-surface-invert">
              <div className="flex size-full items-center justify-center">
                <Typography type={TypographyType.Body} bold>
                  {index + 1}
                </Typography>
              </div>
            </div>
          </div>
          <div className="flex flex-shrink flex-col gap-1">
            <Typography type={TypographyType.Callout} bold>
              {title}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
            >
              {description}
            </Typography>
          </div>
        </div>
      ))}
    </div>
  </FlexCol>
);

const faq = [
  {
    title: 'How do you decide which opportunities to show me?',
    description:
      'We look at your skills, interests, and career goals based on the information you’ve shared and your activity on the platform. From there, we identify roles that we believe could be a strong fit and worth your attention. The goal is not to flood you with options but to surface opportunities that actually have the potential to move your career forward.',
  },
  {
    title: 'Will recruiters contact me directly?',
    description:
      'No. Recruiters never get direct access to you without your approval. We first confirm there’s genuine mutual interest before making any introductions, which means you’ll never get blindsided by a cold DM or an unwanted email. You decide if and when conversations happen.',
  },
  {
    title:
      'What would I need to provide in order to get these kinds of opportunities going forward?',
    description:
      'The more we know about your skills, preferences, and career goals, the better we can tailor what you see. Uploading your CV and answering a few quick questions allows us to filter out irrelevant roles and focus on opportunities that are genuinely worth your attention. Your CV isn’t shared with anyone until you approve an opportunity and we’ve confirmed mutual interest with the recruiter.',
  },
  {
    title: 'Can I set the conditions for the opportunities I see?',
    description:
      'Yes. What you’re seeing now is our best first guess based on your profile, but you can define exactly what “worth it” means to you. In your profile settings, you can set the specific conditions — role type, salary expectations, tech stack, location, and more — that we must meet before surfacing future opportunities. That way, every opportunity respects your time and attention.',
  },
  {
    title: 'Do I have to pay for this service?',
    description:
      'No. This is 100% free for developers. We’re building a better, more respectful way to get hired, and that means removing the usual paywalls or fees. There’s no hidden cost for being introduced to a recruiter through our process.',
  },
  {
    title: 'What happens after I approve an opportunity?',
    description:
      'We’ll ask for a few more details or quick screening answers to save time for both you and the recruiter. Then we speak directly with the recruiter to confirm they’re interested in moving forward. If both sides say yes, we make the warm introduction.',
  },
  {
    title: 'Will you share my CV or profile without my permission?',
    description:
      'Never. Your information stays private until you explicitly approve an opportunity and we’ve confirmed mutual interest. Until then, no one outside our team will know you’ve been approached.',
  },
  {
    title: 'Is this going to turn into another inbox full of recruiter spam?',
    description:
      'Absolutely not. You’ll never get cold DMs, random connection requests, or templated outreach here. Every opportunity we show you is opt-in, high-context, and matched against your conditions before it reaches you.',
  },
  {
    title: 'Are you going to waste my time with irrelevant roles?',
    description:
      'No. The whole point of this system is to eliminate the irrelevant and repetitive. You’ll only see roles that meet your criteria or have a strong reason to be surfaced. This becomes a source of signal — not noise — so when you do hear from us, you know it’s worth your time.',
  },
];
const FAQSection = (): ReactElement => (
  <FlexCol className="gap-10 text-center">
    <Typography type={TypographyType.Title3} bold>
      Everything else you might want to know
    </Typography>
    <FlexCol className="gap-2">
      {faq.map(({ title, description }) => (
        <div
          key={title}
          className="rounded-10 bg-surface-float px-6 py-4 text-left"
        >
          <Accordion title={<Typography>{title}</Typography>}>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              {description}
            </Typography>
          </Accordion>
        </div>
      ))}
    </FlexCol>
  </FlexCol>
);

const JobsWelcomePage = (): ReactElement => {
  const { jobsWelcome } = useThemedAsset();
  return (
    <>
      <img
        src={jobsWelcome}
        alt="Jobs welcome"
        className="fixed left-1/2 top-12 z-0 max-w-[60rem] -translate-x-1/2 transform laptop:top-14"
      />
      <div className="relative mx-4 mt-10 max-w-[47.875rem] tablet:mx-auto">
        <FlexCol className="gap-8 tablet:mx-4 laptop:mx-0">
          <HeaderSection />
          <BenefitSection />
          <HowItWorksSection />
          <FAQSection />
        </FlexCol>
      </div>
    </>
  );
};

JobsWelcomePage.getLayout = getLayout;
JobsWelcomePage.layoutProps = { screenCentered: true, seo };

export default JobsWelcomePage;
