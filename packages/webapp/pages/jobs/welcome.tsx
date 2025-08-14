import type { ReactElement } from 'react';
import React from 'react';

import type { NextSeoProps } from 'next-seo';
import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
import { DailyIcon, VIcon } from '@dailydotdev/shared/src/components/icons';
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
import { cloudinaryDevcardDefaultCoverImage } from '@dailydotdev/shared/src/lib/image';
import { Accordion } from '@dailydotdev/shared/src/components/accordion';
import { defaultOpenGraph, defaultSeo, defaultSeoTitle } from '../../next-seo';
import { getLayout } from '../../components/layouts/NoSidebarLayout';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

const HeaderSection = (): ReactElement => (
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
      className="mt-4 text-black"
    >
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

const benefits = [
  {
    icon: <DailyIcon />,
    title: 'No more cold outreach',
    description:
      'No cold DMs from strangers. Only real roles from real teams, surfaced when it’s actually worth your time.',
  },
  {
    icon: <VIcon />,
    title: 'No more surprises',
    description:
      'Private by default. You review opportunities quietly, choose yes or no, and nothing moves without your OK.',
  },
  {
    icon: <DailyIcon />,
    title: 'No more irrelevant offers',
    description:
      'We connect you to with roles we believe would fit your skills, interests, and goals. If it isn’t a fit, you won’t see it.',
  },
];

const BenefitSection = (): ReactElement => (
  <FlexRow className="gap-4 text-center">
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
  </FlexRow>
);

const howItWorks = [
  {
    image: cloudinaryDevcardDefaultCoverImage,
    title: 'Review the opportunity',
    description:
      'See the role and decide if it’s worth moving forward. No pressure and no one even knows you’ve been approached.',
  },
  {
    image: cloudinaryDevcardDefaultCoverImage,
    title: 'We’ll check mutual interest',
    description:
      'We talk directly with the recruiter to confirm they’re genuinely interested before you invest a minute more.',
  },
  {
    image: cloudinaryDevcardDefaultCoverImage,
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
    <FlexRow className="gap-4 text-left">
      {howItWorks.map(({ image, title, description }) => (
        <FlexCol className="flex-1 gap-1" key={title}>
          <img
            src={image}
            alt={title}
            className="mb-3 h-24 w-full rounded-16"
          />
          <Typography type={TypographyType.Callout} bold>
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
    </FlexRow>
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
  return (
    <>
      <img
        src="https://media.daily.dev/image/upload/s--iK8V4i-t--/f_auto/v1754903868/public/darkbg-Super%20Career%20Connector"
        alt="Jobs welcome"
        className="fixed left-1/2 z-0 max-w-[60rem] -translate-x-1/2 transform"
      />
      <div className="relative mx-auto mt-10 max-w-[47.875rem]">
        <FlexCol className="gap-8">
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
