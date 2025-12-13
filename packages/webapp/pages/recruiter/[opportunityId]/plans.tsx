import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import {
  ButtonColor,
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
import { recruiterPricesQueryOptions } from '@dailydotdev/shared/src/features/opportunity/graphql';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { formatCurrency } from '@dailydotdev/shared/src/lib/utils';
import { getPathnameWithQuery } from '@dailydotdev/shared/src/lib';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
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
}: PricingPlanProps): ReactElement => {
  const { container } = className || {};
  return (
    <div
      className={classNames(
        'flex flex-1 flex-col gap-6 rounded-16 border border-border-subtlest-tertiary p-6',
        container,
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Typography type={TypographyType.Title2}>{emoji}</Typography>
            <Typography type={TypographyType.Title2} bold>
              {title}
            </Typography>
          </div>
          {badge && (
            <span className="rounded-6 bg-brand-active px-2 py-1">
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
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
        >
          {description}
        </Typography>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex flex-row gap-2">
          <Typography type={TypographyType.Mega1} bold>
            {price}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {priceType}
          </Typography>
        </div>
        <Typography
          type={TypographyType.Footnote}
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
        className="w-full"
      >
        {ctaText}
      </Button>
      <div className="flex flex-col gap-1 border-t border-border-subtlest-tertiary pt-6">
        {features.map((feature) => (
          <div key={feature.text}>
            <Tooltip content={feature?.info}>
              <div className="flex items-center gap-1">
                <Typography
                  type={TypographyType.Body}
                  color={TypographyColor.Secondary}
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
  className?: PricingPlanProps['className'];
};

const RecruiterPlans = (): ReactElement => {
  const router = useRouter();

  const additionalCopy: AdditionalCopy[] = [
    {
      icon: '🪴',
      features: [
        {
          text: 'Reach up to 100 developers / day',
          info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          text: 'Unlimited recruiter seats',
          info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          text: 'Access to high-intent developer profiles',
          info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          text: 'Real-time matching notifications',
          info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          text: 'Basic analytics dashboard',
          info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
      ],
      description:
        'Start reaching high-intent developers and see how trust-first sourcing changes your hiring experience.',
      ctaText: 'Get started',
    },
    {
      icon: '🚀',
      features: [
        {
          text: 'Reach up to 300 developers / day',
          info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          text: 'Unlimited recruiter seats',
          info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          text: 'Access to high-intent developer profiles',
          info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          text: 'Real-time matching notifications',
          info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          text: 'Advanced analytics & insights',
          info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          text: 'Priority support',
          info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
      ],
      badge: 'best value',
      description:
        'Increase your daily reach and accelerate introductions with higher matching volume.',
      ctaText: 'Get started',
      ctaColor: ButtonColor.Cabbage,
      className: {
        container: 'bg-brand-float',
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
        {prices?.map((price, index) => {
          const additionalCopyItem = additionalCopy[index];

          return (
            <PricingPlan
              key={price.priceId}
              emoji={additionalCopyItem.icon}
              title={price.metadata.title}
              badge={additionalCopyItem.badge}
              description={additionalCopyItem.description}
              price={formatCurrency(price.price.monthly.amount, {
                minimumFractionDigits: 0,
              })}
              priceType="/mo"
              billingInfo="Billed monthly per role"
              features={additionalCopyItem.features}
              ctaText={additionalCopyItem.ctaText}
              ctaColor={additionalCopyItem.ctaColor}
              onCtaClick={() => {
                router.push(
                  getPathnameWithQuery(
                    `/recruiter/${opportunityId}/payment`,
                    new URLSearchParams({
                      pid: price.priceId,
                    }),
                  ),
                );
              }}
              className={additionalCopyItem.className}
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
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            Get a tailored plan built around your hiring scale, workflow, and
            internal requirements.
          </Typography>
        </div>
        <Button
          tag="a"
          variant={ButtonVariant.Primary}
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
