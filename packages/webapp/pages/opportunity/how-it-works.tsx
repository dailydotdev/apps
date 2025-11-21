import React, { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';

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
  jobsHowItWorksOne,
  jobsHowItWorksThree,
  jobsHowItWorksTwo,
} from '@dailydotdev/shared/src/lib/image';
import { Accordion } from '@dailydotdev/shared/src/components/accordion';
import { useThemedAsset } from '@dailydotdev/shared/src/hooks/utils';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';

import { useActions } from '@dailydotdev/shared/src/hooks';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { getCandidatePreferencesOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { useQuery } from '@tanstack/react-query';
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
  const { logEvent } = useLogContext();
  const logRef = useRef<typeof logEvent>();
  const hasLoggedRef = useRef(false);
  logRef.current = logEvent;

  const { isActionsFetched, completeAction } = useActions();

  useEffect(() => {
    if (hasLoggedRef.current) {
      return;
    }
    logRef.current({
      event_name: LogEvent.OnboardingCandidate,
    });
    hasLoggedRef.current = true;
  }, [logRef]);

  useEffect(() => {
    if (!isActionsFetched) {
      return;
    }

    completeAction(ActionType.OpportunityWelcomePage);
  }, [completeAction, isActionsFetched]);

  return (
    <FlexCol className="items-center gap-2">
      <FlexRow className="items-center gap-1">
        <DailyIcon />{' '}
        <Typography
          center
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Career mode unlocked (beta)
        </Typography>
      </FlexRow>
      <Typography center type={TypographyType.LargeTitle} bold>
        Welcome to a new hiring experience that respects your time, privacy, and
        intelligence
      </Typography>
      <FlexRow className="items-center gap-1">
        <VIcon className="text-accent-avocado-subtlest" />
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          <strong>100% private.</strong> Your career, your rules.
        </Typography>
      </FlexRow>
    </FlexCol>
  );
};

const benefits = [
  {
    icon: <ShieldPlusIcon secondary />,
    title: 'No recruiter spam',
    description:
      'No cold DMs from strangers. Only real roles from vetted teams, surfaced when there is a strong reason to talk.',
  },
  {
    icon: <MedalBadgeIcon />,
    title: 'Private until you say yes',
    description:
      'You stay invisible until you choose to engage. You quietly review matches, and nothing moves without your clear approval.',
  },
  {
    icon: <JobIcon secondary />,
    title: 'Signal, not noise',
    description:
      'We match you with roles based on your skills, preferences, and goals. If it is not a real fit, you will not see it.',
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
    title: 'Review the job in private',
    description:
      'You see the role, the context, and the company. You decide if it is worth your attention. No one knows you have been approached unless you say yes.',
  },
  {
    image: jobsHowItWorksTwo,
    title: 'We check real mutual interest',
    description:
      'We talk directly with the recruiter to confirm they are aligned with your expectations, and ready to respect your time before you invest another minute.',
  },
  {
    image: jobsHowItWorksThree,
    title: 'We make a warm intro',
    description:
      'Only if both sides say yes do we connect you directly. Every conversation starts with clear intent and good vibes.',
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
    title: 'How do you decide which jobs to show me?',
    description:
      'We look at your skills, interests, and career goals based on your profile and activity on the platform. From there, we surface roles that we believe are genuinely worth your attention. The goal is not to flood you with options but to show you matches that can actually move your career forward.',
  },
  {
    title: 'How can I increase my chances of getting hired?',
    description:
      'The more context you share, the better we can match you. Upload your CV, complete your profile, and set your job preferences so we know your skills, your must haves, and your deal breakers. This lets us filter out noise and prioritize roles that are most likely to turn into real offers. Your CV and details stay private until you approve a match.',
  },
  {
    title: 'Will recruiters contact me directly?',
    description:
      'No. Recruiters never get direct access to you without your approval. We first confirm there is genuine mutual interest before making any introductions, so you do not get blindsided by cold DMs or random emails. You decide if and when conversations happen.',
  },
  {
    title:
      'What would I need to provide in order to get these kinds of job matches going forward?',
    description:
      'Uploading your CV and answering a few quick questions about your experience, preferences, and goals helps us do the heavy lifting for you. It lets us filter out irrelevant roles and focus on matches that respect your time. Your CV is never shared with a recruiter until you approve a job match and we have confirmed mutual interest.',
  },
  {
    title: 'Can I set the conditions for the job matches I see?',
    description:
      'Yes. What you see at first is our best initial guess based on your profile, but you are in control. In your profile settings, you can set what “worth it” means to you, including role type, salary expectations, tech stack, location, and more. Every future job match must meet those conditions before it reaches you.',
  },
  {
    title: 'Do I have to pay for this service? (Hint: No)',
    description:
      'No. This is free for developers. We are building a better, more respectful way to get hired, which means no paywalls and no hidden fees for being introduced to a recruiter.',
  },
  {
    title: 'What happens after I approve a job match?',
    description:
      'We may ask for a few more details or quick screening answers to save time for both you and the recruiter. Then we talk directly with the recruiter to confirm they want to move forward. If both sides say yes, we make the warm introduction.',
  },
  {
    title: 'Will you share my CV or profile without my permission?',
    description:
      'Never. Your information stays private until you explicitly approve a job match and we have confirmed mutual interest with the recruiter. Until then, no one outside our team knows you have been approached.',
  },
  {
    title: 'Is this going to turn into another inbox full of recruiter spam?',
    description:
      'No. You will not get cold DMs, random connection requests, or templated outreach here. Every job match you see is opt in, has context, and is checked against your conditions before it reaches you.',
  },
  {
    title: 'Are you going to waste my time with irrelevant roles?',
    description:
      'No. The point of this system is to remove as much noise as possible. You will only see roles that meet your criteria or have a strong reason to be surfaced. When you hear from us, you know it is worth a look.',
  },
];

const FAQSection = (): ReactElement => (
  <FlexCol className="gap-10 pb-10 text-center">
    <Typography type={TypographyType.Title3} bold>
      Everything else you might want to know
    </Typography>
    <FlexCol className="gap-2">
      {faq.map(({ title, description }) => (
        <div
          key={title}
          className="rounded-10 bg-surface-float px-6 py-3 text-left"
        >
          <Accordion
            title={<Typography>{title}</Typography>}
            className={{ button: '!h-auto' }}
          >
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

export const BackgroundImage = (): ReactElement => {
  const { jobsWelcome } = useThemedAsset();
  return (
    <img
      src={jobsWelcome}
      alt="Jobs welcome"
      className="fixed left-1/2 top-12 -z-1 max-w-[60rem] -translate-x-1/2 transform laptop:top-14"
    />
  );
};

const JobsWelcomePage = (): ReactElement => {
  const { user, isAuthReady } = useAuthContext();

  const { isPending } = useQuery(getCandidatePreferencesOptions(user?.id));

  if (!isAuthReady) {
    return <BackgroundImage />;
  }

  if (isAuthReady && isPending) {
    return null;
  }

  return (
    <>
      <BackgroundImage />
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
