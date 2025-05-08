import type { ReactElement } from 'react';
import React, { useId } from 'react';
import classNames from 'classnames';
import { usePaymentContext } from '../../contexts/payment/context';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { DevPlusIcon, VIcon } from '../icons';
import { Button, ButtonVariant } from '../buttons/Button';
import { defaultFeatureList, plusFeatureList, PlusList } from './PlusList';
import { usePlusSubscription } from '../../hooks';
import { LogEvent, TargetId } from '../../lib/log';
import { IconSize } from '../Icon';
import { PlusPlanExtraLabel } from './PlusPlanExtraLabel';
import type { ProductPricingPreview } from '../../graphql/paddle';

export enum OnboardingPlans {
  Free = 'Free',
  Plus = 'Plus',
}

interface PlusCardProps {
  currency: string;
  onClickNext: () => void;
  onClickPlus: () => void;
  productOption?: ProductPricingPreview;
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
  onClickPlus,
}: PlusCardProps): ReactElement => {
  const id = useId();
  const { logSubscriptionEvent } = usePlusSubscription();
  const { isFreeTrialExperiment } = usePaymentContext();

  const isPaidPlan = !!plan;
  const cardContentName = isPaidPlan
    ? OnboardingPlans.Plus
    : OnboardingPlans.Free;
  const { heading, features } = cardContent[cardContentName];

  const price = {
    amount: plan?.price.monthly?.formatted ?? '0',
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
        {plan?.metadata.caption && (
          <PlusPlanExtraLabel
            color={plan?.metadata.caption.color}
            label={plan?.metadata.caption.copy}
            className="ml-3"
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
          onClick={() => {
            logSubscriptionEvent({
              event_name: LogEvent.OnboardingUpgradePlus,
              target_id: TargetId.Onboarding,
            });
            onClickPlus();
          }}
          type="button"
          title="Get started with Plus"
          variant={ButtonVariant.Primary}
        >
          {isFreeTrialExperiment ? 'Get started for free' : 'Get started'}
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
          icon={isPaidPlan ? VIcon : null}
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
  onClickPlus: () => void;
  productOption?: ProductPricingPreview;
}

export const PlusComparingCards = ({
  productOption,
  onClickNext,
  onClickPlus,
}: PlusComparingCardsProps): ReactElement => {
  const currency = productOption.currency?.symbol;

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
          onClickPlus={onClickPlus}
        />
      ))}
    </ul>
  );
};
