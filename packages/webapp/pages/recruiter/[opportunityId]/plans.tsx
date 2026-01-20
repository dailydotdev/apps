import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { ButtonColor } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyType,
  TypographyColor,
  TypographyTag,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { InfoIcon } from '@dailydotdev/shared/src/components/icons/Info';
import { AgentIcon } from '@dailydotdev/shared/src/components/icons/Agent';
import { SuperAgentIcon } from '@dailydotdev/shared/src/components/icons/SuperAgent';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { recruiterScheduleUrl } from '@dailydotdev/shared/src/lib/constants';

import classNames from 'classnames';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { recruiterPricesQueryOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getPathnameWithQuery } from '@dailydotdev/shared/src/lib';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import {
  CalendarIcon,
  CreditCardIcon,
  StarIcon,
  UserIcon,
  WarningIcon,
} from '@dailydotdev/shared/src/components/icons';
import { RadixAccordion } from '@dailydotdev/shared/src/components/accordion';
import {
  getLayout,
  layoutProps,
} from '../../../components/layouts/RecruiterLayout';

type PricingFeature = {
  text: string;
  info?: string;
};

type PricingPlanProps = {
  icon: React.ReactElement;
  title: string;
  description: string;
  price: string;
  priceType: string;
  billingInfo: string;
  features: PricingFeature[];
  ctaText: string;
  ctaVariant?: ButtonVariant;
  ctaColor?: ButtonColor;
  badge?: string;
  onCtaClick: () => void;
  className?: {
    container?: string;
  };
  containerStyle?: React.CSSProperties;
};

const PricingPlan = ({
  icon,
  title,
  description,
  price,
  priceType,
  billingInfo,
  features,
  ctaText,
  ctaVariant = ButtonVariant.Primary,
  ctaColor,
  badge,
  onCtaClick,
  className,
  containerStyle,
}: PricingPlanProps): ReactElement => {
  const { container } = className || {};
  return (
    <div
      className={classNames(
        'relative isolate flex flex-1 flex-col gap-6 overflow-hidden rounded-16 border border-border-subtlest-tertiary p-6',
        container,
      )}
    >
      {containerStyle && (
        <div
          className="-z-10 absolute -inset-[50%] -top-[60%] rotate-[25deg] backdrop-blur-sm"
          style={containerStyle}
        />
      )}
      <div className="z-10 relative flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {icon}
            <Typography type={TypographyType.Title3} bold>
              {title}
            </Typography>
          </div>
          {badge && (
            <span className="rounded-8 bg-brand-float px-2 py-1">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Brand}
                bold
              >
                {badge}
              </Typography>
            </span>
          )}
        </div>
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Tertiary}
        >
          {description}
        </Typography>
      </div>
      <div className="z-10 relative flex flex-col gap-1">
        <div className="flex flex-row gap-2">
          <Typography type={TypographyType.Mega1} bold>
            {price}
          </Typography>
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Tertiary}
          >
            {priceType}
          </Typography>
        </div>
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Tertiary}
        >
          {billingInfo}
        </Typography>
      </div>
      <Button
        variant={ctaVariant}
        size={ButtonSize.Large}
        color={ctaColor}
        onClick={onCtaClick}
        className="z-10 relative w-full"
      >
        {ctaText}
      </Button>
      <div className="z-10 relative flex flex-col gap-1 pt-4">
        {features.map((feature) => (
          <div key={feature.text} className="flex items-start gap-2">
            <VIcon
              size={IconSize.Small}
              className="mt-0.5 shrink-0 text-accent-avocado-default"
              secondary
            />
            <Tooltip content={feature?.info}>
              <div className="flex flex-1 items-center gap-1">
                <Typography
                  type={TypographyType.Subhead}
                  color={TypographyColor.Tertiary}
                  className="flex-1"
                >
                  {feature.text}
                </Typography>
                <InfoIcon
                  size={IconSize.Small}
                  className="text-text-disabled"
                />
              </div>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
};

type AdditionalCopy = {
  icon: React.ReactElement;
  features: PricingFeature[];
  badge?: string;
  description: string;
  ctaText: string;
  ctaColor?: ButtonColor;
  ctaVariant?: ButtonVariant;
  className?: PricingPlanProps['className'];
  containerStyle?: React.CSSProperties;
};

const benefitWidgets = [
  {
    icon: CreditCardIcon,
    title: 'No placement fees',
    description: 'Save 15-20% per hire',
  },
  {
    icon: CalendarIcon,
    title: 'Cancel anytime',
    description: 'Month-to-month billing',
  },
  {
    icon: UserIcon,
    title: 'Unlimited hires per role',
    description: 'One role, no per-hire limits',
  },
  {
    icon: StarIcon,
    title: 'Quality over volume',
    description: 'Curated matches, not mass lists',
  },
];

const faq = [
  {
    title: 'Do you have developers in my target region or stack?',
    description:
      'daily.dev has millions of active engineers across 150+ countries, with strong coverage in the US, Europe, and LATAM. All major stacks are represented: frontend, backend, DevOps, AI/ML, mobile, and more. When you create a role, we show you the available inventory upfront so you have full clarity before you start.',
  },
  {
    title: 'I just want to try it out. Where should I start?',
    description:
      "Start with Agent on a single role. It's designed to help you learn how the platform works and see results before scaling. You can always upgrade to Super Agent or add more roles later.",
  },
  {
    title: 'Why a monthly fee instead of placement fees?',
    description:
      'Predictable costs, unlimited upside. With success-based models you typically pay 15-20% per hire. With us, you pay a fixed monthly rate per role. Make one hire or ten, the price stays the same.',
  },
  {
    title: "What does 'per role' mean?",
    description:
      'You only pay for roles that are actively hiring. For example, you might have five roles on the platform but only one active at a time, so you only pay for that one. Pause or reactivate any role anytime from your dashboard.',
  },
  {
    title: 'How quickly will I see introductions?',
    description:
      'Most customers see their first introductions within days, not weeks. Speed depends on your role specifics and how active that talent pool is on daily.dev.',
  },
  {
    title: "What if I don't get quality introductions?",
    description:
      "Our introductions are double opt-in, so engineers only connect when genuinely interested. If you're not seeing results, our team works with you to optimize your role brief and targeting.",
  },
  {
    title: 'Can I cancel anytime?',
    description:
      'Yes. No long-term contracts. Cancel or pause any role directly from your dashboard whenever you need to.',
  },
];

const RecruiterPlans = (): ReactElement => {
  const router = useRouter();

  const additionalCopy: AdditionalCopy[] = [
    {
      icon: <AgentIcon size={IconSize.Medium} />,
      features: [
        {
          text: 'Standard matching pace',
          info: 'Consistent daily exposure to qualified, high-intent engineers.',
        },
        {
          text: 'Access to passive talent',
          info: 'Reach engineers who ignore LinkedIn and job boards but engage daily on our platform.',
        },
        {
          text: 'Unlimited recruiter seats',
          info: 'Invite your entire hiring team at no extra cost.',
        },
        {
          text: 'Unlimited warm introductions',
          info: 'Connect with as many interested candidates as you want.',
        },
        {
          text: 'Native candidate experience',
          info: 'Engineers engage through a seamless, branded experience built into their daily workflow.',
        },
        {
          text: 'Standard support',
          info: 'Email support with 24-48h response time.',
        },
      ],
      description:
        "Your entry point to trust-first recruiting. Access engineers who are growing on daily.dev and aren't reachable anywhere else.",
      ctaText: 'Get started',
      ctaVariant: ButtonVariant.Secondary,
    },
    {
      icon: <SuperAgentIcon size={IconSize.Medium} />,
      features: [
        {
          text: '3× matching pace',
          info: 'Triple your daily exposure to qualified engineers and fill roles faster.',
        },
        {
          text: 'Access to passive talent',
          info: 'Reach engineers who ignore LinkedIn and job boards but engage daily on our platform.',
        },
        {
          text: 'Unlimited recruiter seats',
          info: 'Invite your entire hiring team at no extra cost.',
        },
        {
          text: 'Unlimited warm introductions',
          info: 'Connect with as many interested candidates as you want.',
        },
        {
          text: 'Native candidate experience',
          info: 'Engineers engage through a seamless, branded experience built into their daily workflow.',
        },
        {
          text: 'Reply rate booster',
          info: 'Automated follow-up sequences that keep candidates engaged and responsive.',
        },
        {
          text: 'Candidate insights',
          info: 'See why engineers pass on roles and optimize your job descriptions accordingly.',
        },
        {
          text: 'ATS & CRM integrations',
          info: 'Seamlessly sync candidates with Greenhouse, Lever, Ashby, and more.',
        },
        {
          text: 'Priority support (email, chat, Slack)',
          info: 'Direct line to our support team with expedited response times.',
        },
      ],
      badge: 'MOST POPULAR',
      description:
        'Scale your hiring with 3× the reach. Tap deeper into our exclusive network of engineers who only respond here.',
      ctaText: 'Get started',
      className: {
        container: 'border-brand-default bg-brand-float',
      },
    },
  ];

  const { user, isLoggedIn } = useAuthContext();

  const { data: prices, isPending } = useQuery(
    recruiterPricesQueryOptions({
      user,
      isLoggedIn,
    }),
  );

  const opportunityId = router.query.opportunityId as string;
  const showPaymentRequired = router.query.required === '1';

  return (
    <div className="mx-auto flex w-full max-w-[64rem] flex-col gap-8 px-4 py-8 tablet:px-0">
      {showPaymentRequired && (
        <div className="bg-status-warning/10 flex items-center gap-2 rounded-12 border border-status-warning p-4">
          <WarningIcon className="text-status-warning" size={IconSize.Small} />
          <Typography type={TypographyType.Callout}>
            Select a plan to continue setting up your job posting
          </Typography>
        </div>
      )}

      <div className="flex flex-col gap-2 pt-2">
        <Typography type={TypographyType.Title1} bold center>
          Simple pricing. Unlimited hiring.
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Tertiary}
          center
        >
          Flat monthly rate per role. No placement fees, no contracts. Cancel
          anytime. The way hiring should work.
        </Typography>
      </div>

      <div className="flex items-center gap-3 rounded-12 border-l-4 border-accent-cabbage-default bg-gradient-to-r from-action-share-float to-transparent px-4 py-3">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Callout}
            bold
          >
            Not the one paying?
          </Typography>{' '}
          No problem — you can share a secure payment link with your finance
          team in the next step.
        </Typography>
      </div>

      <div className="flex flex-col gap-4 laptop:flex-row">
        {isPending && !prices && (
          <div className="flex min-h-[31rem] flex-1 flex-col items-center justify-center gap-6 rounded-16 border border-border-subtlest-tertiary p-6">
            <Loader />
          </div>
        )}
        {prices?.map((priceItem, index) => {
          const additionalCopyItem = additionalCopy[index];

          return (
            <PricingPlan
              key={priceItem.priceId}
              icon={additionalCopyItem.icon}
              title={priceItem.metadata.title}
              badge={additionalCopyItem.badge}
              description={additionalCopyItem.description}
              price={priceItem.price.monthly.formatted.replace('.00', '')}
              priceType="/mo"
              billingInfo="Billed monthly per role"
              features={additionalCopyItem.features}
              ctaText={additionalCopyItem.ctaText}
              ctaColor={additionalCopyItem.ctaColor}
              ctaVariant={additionalCopyItem.ctaVariant}
              onCtaClick={() => {
                router.push(
                  getPathnameWithQuery(
                    `/recruiter/${opportunityId}/payment`,
                    new URLSearchParams({
                      pid: priceItem.priceId,
                    }),
                  ),
                );
              }}
              className={additionalCopyItem.className}
              containerStyle={additionalCopyItem.containerStyle}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 laptop:grid-cols-4">
        {benefitWidgets.map((widget) => (
          <div
            key={widget.title}
            className="flex flex-col items-center gap-2 rounded-12 border border-border-subtlest-tertiary p-4 text-center"
          >
            <widget.icon size={IconSize.Medium} className="text-text-primary" />
            <Typography type={TypographyType.Callout} bold>
              {widget.title}
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              {widget.description}
            </Typography>
          </div>
        ))}
      </div>

      <div className="bg-surface-subtle flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-6 laptop:flex-row laptop:items-center laptop:justify-between">
        <div className="flex flex-1 flex-col flex-wrap gap-2">
          <Typography type={TypographyType.Title2} bold>
            Looking for higher volumes?
          </Typography>
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Tertiary}
          >
            Get a tailored plan built around your hiring scale, workflow, and
            internal requirements.
          </Typography>
        </div>
        <Button
          tag="a"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Medium}
          href={recruiterScheduleUrl}
          className="laptop:w-auto"
          target="_blank"
          rel={anchorDefaultRel}
        >
          Talk to sales
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        <Typography type={TypographyType.Title2} bold>
          Frequently asked questions
        </Typography>
        <RadixAccordion items={faq} />
      </div>
    </div>
  );
};

RecruiterPlans.getLayout = getLayout;
RecruiterPlans.layoutProps = layoutProps;

export default RecruiterPlans;
