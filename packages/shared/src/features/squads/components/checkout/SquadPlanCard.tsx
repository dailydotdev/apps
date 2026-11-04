import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { CoreIcon, VIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import type { SquadPlan } from '../../lib/plans';
import {
  SQUAD_PLAN_CASHBACK_PERCENTAGE,
  squadPlanDetails,
} from '../../lib/plans';

interface SquadPlanCardProps {
  plan: SquadPlan;
  price: string;
  isSelected?: boolean;
  /** A pill beside the name, e.g. Recommended or Current plan. */
  badge?: string;
  /** The card's button, at the bottom. */
  action?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export const SquadPlanFeatureList = ({
  title,
  features,
}: {
  title: string;
  features: string[];
}): ReactElement => (
  <ul className="flex flex-col gap-2">
    <li className="font-bold text-text-tertiary typo-footnote">{title}</li>
    {features.map((feature) => (
      <li key={feature} className="flex items-start gap-2">
        <VIcon
          size={IconSize.Small}
          className="shrink-0 text-accent-avocado-default"
        />
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          {feature}
        </Typography>
      </li>
    ))}
  </ul>
);

export const SquadPlanPrice = ({ price }: { price: string }): ReactElement => (
  <p className="flex items-baseline gap-1">
    <span className="font-bold tabular-nums text-text-primary typo-title1">
      {price}
    </span>
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Callout}
      color={TypographyColor.Tertiary}
    >
      / month
    </Typography>
  </p>
);

export const SquadPlanCashback = ({
  plan,
}: {
  plan: SquadPlan;
}): ReactElement => (
  <div className="flex items-center gap-2 rounded-12 bg-surface-float px-3 py-2">
    <CoreIcon size={IconSize.Small} className="shrink-0" />
    <span className="flex flex-col">
      <Typography type={TypographyType.Callout} bold>
        {`${SQUAD_PLAN_CASHBACK_PERCENTAGE[plan]}% cashback`}
      </Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        to boost your posts, every month
      </Typography>
    </span>
  </div>
);

export const SquadPlanCard = ({
  plan,
  price,
  isSelected = false,
  badge,
  action,
  onClick,
  className,
}: SquadPlanCardProps): ReactElement => {
  const { title, tagline, featuresTitle, features } = squadPlanDetails[plan];
  const content = (
    <>
      <span className="flex flex-wrap items-center gap-2">
        <Typography tag={TypographyTag.Span} type={TypographyType.Title3} bold>
          {title}
        </Typography>
        {badge && (
          <span className="rounded-8 bg-accent-cabbage-flat px-2 py-0.5 font-bold text-accent-cabbage-default typo-caption1">
            {badge}
          </span>
        )}
      </span>
      <SquadPlanPrice price={price} />
      <SquadPlanCashback plan={plan} />
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        {tagline}
      </Typography>
      <SquadPlanFeatureList title={featuresTitle} features={features} />
    </>
  );
  const cardClassName = classNames(
    'flex flex-col gap-4 rounded-16 border p-5 text-left',
    isSelected
      ? 'border-accent-cabbage-default bg-surface-float'
      : 'border-border-subtlest-tertiary',
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        role="radio"
        aria-checked={isSelected}
        onClick={onClick}
        className={classNames(
          cardClassName,
          !isSelected && 'hover:border-border-subtlest-secondary',
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={cardClassName}>
      {content}
      {action && <div className="mt-auto pt-2">{action}</div>}
    </div>
  );
};
