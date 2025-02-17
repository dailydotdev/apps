import type { ReactElement } from 'react';
import React, { useId } from 'react';
import classNames from 'classnames';
import type { ProductOption } from '../../contexts/PaymentContext';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { DevPlusIcon, MarkOkIcon } from '../icons';
import { Button, ButtonVariant } from '../buttons/Button';
import { defaultFeatureList, plusFeatureList, PlusList } from './PlusList';
import { useConditionalFeature, usePlusSubscription } from '../../hooks';
import { plusUrl } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';
import { LogEvent, TargetId } from '../../lib/log';
import { IconSize } from '../Icon';
import { featurePlusCtaCopy } from '../../lib/featureManagement';
import { PlusLabelColor, PlusPlanExtraLabel } from './PlusPlanExtraLabel';

export enum OnboardingPlans {
  Free = 'Free',
  Plus = 'Plus',
}

interface PlusCardProps {
  currency: string;
  onClickNext: () => void;
  productOption?: ProductOption;
}

const cardContent = {
  [OnboardingPlans.Free]: {
    heading: {
      label: 'Free',
      color: TypographyColor.Primary,
    },
    features: {
      items: defaultFeatureList,
    },
  },
  [OnboardingPlans.Plus]: {
    heading: {
      label: 'Plus',
      color: TypographyColor.Plus,
    },
    features: {
      items: plusFeatureList,
    },
  },
};

const PlusCard = ({
  currency,
  productOption: plan,
  onClickNext,
}: PlusCardProps): ReactElement => {
  const id = useId();
  const { logSubscriptionEvent, isPlus } = usePlusSubscription();
  const {
    value: { full: plusCta },
  } = useConditionalFeature({
    feature: featurePlusCtaCopy,
    shouldEvaluate: !isPlus,
  });

  const isPaidPlan = !!plan;
  const cardContentName = isPaidPlan
    ? OnboardingPlans.Plus
    : OnboardingPlans.Free;
  const { heading, features } = cardContent[cardContentName];

  const price = {
    amount: plan?.price.formatted ?? '0',
  };

  return (
    <li
      aria-labelledby={`${id}-heading`}
      className={classNames(
        'mx-auto w-[21rem] rounded-16 border border-border-subtlest-tertiary p-4',
        isPaidPlan && 'bg-surface-float',
      )}
    >
      <div className="flex items-start justify-between gap-6">
        <Typography
          bold
          className="mb-4 flex gap-1"
          tag={TypographyTag.H3}
          type={TypographyType.Title3}
          color={heading.color}
          id={`${id}-heading`}
        >
          {isPaidPlan && <DevPlusIcon aria-hidden size={IconSize.Small} />}
          {heading.label}
        </Typography>
        {plan?.extraLabel && (
          <PlusPlanExtraLabel
            color={PlusLabelColor.Help}
            label={plan.extraLabel}
            className="ml-3"
            typographyProps={{ color: TypographyColor.StatusHelp }}
          />
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <Typography bold tag={TypographyTag.Span} type={TypographyType.Title1}>
          {!isPaidPlan && currency}
          {price.amount}
        </Typography>
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Footnote}
        >
          /month
        </Typography>
      </div>
      {!isPaidPlan ? (
        <Button
          className="my-4 block w-full"
          onClick={() => {
            logSubscriptionEvent({
              event_name: LogEvent.OnboardingSkipPlus,
              target_id: TargetId.Onboarding,
            });
            onClickNext();
          }}
          title="Continue without Plus"
          variant={ButtonVariant.Secondary}
          type="button"
        >
          Join for free
        </Button>
      ) : (
        <Button
          className="my-4 block w-full"
          href={`${plusUrl}?selectedPlan=${plan?.value}`}
          onClick={() => {
            logSubscriptionEvent({
              event_name: LogEvent.OnboardingUpgradePlus,
              target_id: TargetId.Onboarding,
            });
          }}
          rel={anchorDefaultRel}
          tag="a"
          target="_blank"
          title={plusCta}
          variant={ButtonVariant.Primary}
        >
          {plusCta}
        </Button>
      )}
      <Typography
        className="mb-4 text-center"
        color={TypographyColor.Tertiary}
        type={TypographyType.Footnote}
      >
        {isPaidPlan ? (
          <>
            30 day hassle-free refund.{' '}
            <span className="whitespace-nowrap">No questions asked.</span>
          </>
        ) : (
          'Free forever'
        )}
      </Typography>
      <div>
        {isPaidPlan && (
          <Typography
            bold
            className="mb-2"
            color={TypographyColor.Primary}
            type={TypographyType.Caption1}
          >
            Everything in Free +
          </Typography>
        )}
        <PlusList
          className="!py-0"
          items={features.items}
          icon={isPaidPlan ? MarkOkIcon : null}
          iconProps={{ size: IconSize.Size16, className: `!mx-0` }}
          typographyProps={{
            type: TypographyType.Caption1,
            className: '!gap-1',
          }}
          badgeProps={{ className: '!px-1' }}
        />
      </div>
    </li>
  );
};

interface PlusComparingCardsProps {
  onClickNext: () => void;
  productOption?: ProductOption;
}

export const PlusComparingCards = ({
  productOption,
  onClickNext,
}: PlusComparingCardsProps): ReactElement => {
  const currency = productOption.currencySymbol;

  return (
    <ul
      aria-label="Pricing plans"
      className="mx-auto flex grid-cols-1 flex-col-reverse place-content-center items-start gap-6 tablet:grid-cols-2 laptop:grid"
    >
      {Object.values(OnboardingPlans).map((plan) => (
        <PlusCard
          key={plan}
          currency={currency}
          productOption={
            plan === OnboardingPlans.Plus ? productOption : undefined
          }
          onClickNext={onClickNext}
        />
      ))}
    </ul>
  );
};
