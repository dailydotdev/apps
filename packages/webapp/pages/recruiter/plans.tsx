import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  ButtonColor,
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
import { getLayout } from '../../components/layouts/RecruiterLayout';

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

const RecruiterPlans = (): ReactElement => {
  const router = useRouter();

  const handleStarterClick = () => {
    router.push('/recruiter/payment?plan=starter');
  };

  const handleBoostClick = () => {
    router.push('/recruiter/payment?plan=boost');
  };

  const handleSalesClick = () => {
    // TODO: Add contact sales URL or open modal
  };

  const starterFeatures: PricingFeature[] = [
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
  ];

  const boostFeatures: PricingFeature[] = [
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
  ];

  return (
    <div className="mx-auto flex w-full max-w-[48rem] flex-col gap-8 px-4 tablet:px-0">
      <Typography type={TypographyType.Title1} bold center>
        Predictable pricing built for teams who hate hidden fees
      </Typography>

      <div className="flex flex-col gap-4 laptop:flex-row">
        <PricingPlan
          emoji="🪴"
          title="Starter"
          description="Start reaching high-intent developers and see how trust-first sourcing changes your hiring experience."
          price="$350"
          priceType="/mo"
          billingInfo="Billed monthly per role"
          features={starterFeatures}
          ctaText="Get started"
          onCtaClick={handleStarterClick}
        />
        <PricingPlan
          emoji="🚀"
          title="Boost"
          badge="best value"
          description="Increase your daily reach and accelerate introductions with higher matching volume."
          price="$700"
          priceType="/mo"
          billingInfo="Billed monthly per role"
          features={boostFeatures}
          ctaText="Get started"
          ctaColor={ButtonColor.Cabbage}
          onCtaClick={handleBoostClick}
          className={{
            container: 'bg-brand-float',
          }}
        />
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
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          onClick={handleSalesClick}
          className="laptop:w-auto"
        >
          Talk to sales
        </Button>
      </div>
    </div>
  );
};

RecruiterPlans.getLayout = getLayout;
export default RecruiterPlans;
