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
} from '@dailydotdev/shared/src/components/typography/Typography';
import { InfoIcon } from '@dailydotdev/shared/src/components/icons/Info';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

import classNames from 'classnames';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { recruiterPricesQueryOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getPathnameWithQuery } from '@dailydotdev/shared/src/lib';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { recruiterPremiumPlanBg } from '@dailydotdev/shared/src/styles/custom';
import { getLayout } from '../../../components/layouts/RecruiterLayout';

type PricingFeature = {
  text: string;
  info?: string;
};

type PricingPlanProps = {
  emoji: string;
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
  emoji,
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
      {badge && (
        <span className="z-10 absolute right-0 top-0 rounded-bl-16 rounded-tr-16 bg-brand-default p-2">
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Primary}
            bold
          >
            {badge}
          </Typography>
        </span>
      )}
      <div className="z-10 relative flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-4">
            <Typography type={TypographyType.Mega1}>{emoji}</Typography>
            <Typography type={TypographyType.Title2} bold>
              {title}
            </Typography>
          </div>
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
          <div key={feature.text}>
            <Tooltip content={feature?.info}>
              <div className="flex items-center gap-1">
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
  icon: string;
  features: PricingFeature[];
  badge?: string;
  description: string;
  ctaText: string;
  ctaColor?: ButtonColor;
  ctaVariant?: ButtonVariant;
  className?: PricingPlanProps['className'];
  containerStyle?: React.CSSProperties;
};

const RecruiterPlans = (): ReactElement => {
  const router = useRouter();

  const additionalCopy: AdditionalCopy[] = [
    {
      icon: '🪴',
      features: [
        {
          text: 'Reach up to 50 developers / day',
          info: 'Send personalized outreach to up to 50 qualified developers daily.',
        },
        {
          text: 'Unlimited recruiter seats',
          info: 'Add your entire recruiting team at no extra cost. Collaborate seamlessly on opportunities.',
        },
        {
          text: 'Access to high-intent developer profiles',
          info: 'Connect with developers actively seeking opportunities, not passive job board browsers.',
        },
        {
          text: 'Real-time matching notifications',
          info: 'Get instant alerts when developers match your opportunity criteria and are ready to connect.',
        },
        {
          text: 'Basic analytics dashboard',
          info: 'Track key metrics like response rates, profile views, and outreach performance.',
        },
      ],
      description:
        'Start reaching high-intent developers and see how trust-first sourcing changes your hiring experience.',
      ctaText: 'Get started',
      ctaVariant: ButtonVariant.Secondary,
    },
    {
      icon: '🚀',
      features: [
        {
          text: 'Reach up to 150 developers / day',
          info: 'Triple your outreach capacity with 150 daily credits. Perfect for high-volume hiring needs.',
        },
        {
          text: 'Unlimited recruiter seats',
          info: 'Add your entire recruiting team at no extra cost. Collaborate seamlessly on opportunities.',
        },
        {
          text: 'Access to high-intent developer profiles',
          info: 'Connect with developers actively seeking opportunities, not passive job board browsers.',
        },
        {
          text: 'Real-time matching notifications',
          info: 'Get instant alerts when developers match your opportunity criteria and are ready to connect.',
        },
        {
          text: 'Advanced analytics & insights',
          info: 'Deep dive into funnel metrics, candidate quality scores, and team performance analytics.',
        },
        {
          text: 'Priority support',
          info: 'Get faster response times and dedicated assistance from our support team when you need it.',
        },
      ],
      badge: 'best value',
      description:
        'Increase your daily reach and accelerate introductions with higher matching volume.',
      ctaText: 'Get started',
      className: {
        container: 'border-brand-default',
      },
      containerStyle: {
        background: recruiterPremiumPlanBg,
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

  return (
    <div className="mx-auto flex w-full max-w-[48rem] flex-col gap-8 px-4 tablet:px-0">
      <Typography type={TypographyType.Title1} bold center>
        Predictable pricing built for teams who hate hidden fees
      </Typography>

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
              emoji={additionalCopyItem.icon}
              title={priceItem.metadata.title}
              badge={additionalCopyItem.badge}
              description={additionalCopyItem.description}
              price={priceItem.price.monthly.formatted}
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
          href="https://recruiter.daily.dev/schedule"
          className="laptop:w-auto"
          target="_blank"
          rel={anchorDefaultRel}
        >
          Talk to sales
        </Button>
      </div>
    </div>
  );
};

RecruiterPlans.getLayout = getLayout;
export default RecruiterPlans;
