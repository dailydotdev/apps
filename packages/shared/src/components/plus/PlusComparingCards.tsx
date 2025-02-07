import type { ReactElement } from 'react';
import React, { useId } from 'react';
import type {
  PaymentContextData,
  ProductOption,
} from '../../contexts/PaymentContext';
import { usePaymentContext } from '../../contexts/PaymentContext';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { DevPlusIcon } from '../icons';
import { Button, ButtonVariant } from '../buttons/Button';
import { defaultFeatureList, plusFeatureList, PlusList } from './PlusList';
import { usePlusSubscription } from '../../hooks';
import { plusUrl } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';
import { LogEvent, TargetId } from '../../lib/log';
import { PlusItemStatus } from './PlusListItem';
import { IconSize } from '../Icon';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { PlusPriceType } from '../../lib/featureValues';
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
      items: [
        {
          label: 'Everything on the Free plan',
          status: PlusItemStatus.Disabled,
        },
        ...plusFeatureList,
      ],
    },
  },
};

const PlusCard = ({
  currency,
  productOption: plan,
  onClickNext,
}: PlusCardProps): ReactElement => {
  const id = useId();
  const { logSubscriptionEvent } = usePlusSubscription();
  const { earlyAdopterPlanId, productOptions } = usePaymentContext();
  const pricingIds = useFeature(feature.pricingIds);

  const isPaidPlan = !!plan;
  const cardContentName = isPaidPlan
    ? OnboardingPlans.Plus
    : OnboardingPlans.Free;
  const { heading, features } = cardContent[cardContentName];

  const { hasDiscount, discountPlan } = productOptions.reduce(
    (acc, product) => {
      if (!isPaidPlan || !earlyAdopterPlanId) {
        return acc;
      }

      const isCardPlan = product.value === plan.value;
      const isDiscountPlan = product.value === earlyAdopterPlanId;
      const isMonthly = pricingIds[product.value] === PlusPriceType.Monthly;

      return {
        hasDiscount: acc.hasDiscount || (isCardPlan && isMonthly),
        discountPlan: acc.discountPlan || (isDiscountPlan ? product : null),
      };
    },
    {
      hasDiscount: false,
      discountPlan: null,
    },
  );

  const price = {
    amount: (hasDiscount ? discountPlan.price : plan?.price) ?? '0',
    cycle: isPaidPlan ? `Billed ${plan?.label?.toLowerCase()}` : 'Free forever',
  };

  return (
    <li
      aria-labelledby={`${id}-heading`}
      className="mx-auto w-[21rem] max-w-full rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4"
    >
      <div className="flex items-start justify-between gap-6">
        <Typography
          bold
          className="mb-1.5 flex gap-1"
          tag={TypographyTag.H3}
          type={TypographyType.Title3}
          color={heading.color}
          id={`${id}-heading`}
        >
          {isPaidPlan && <DevPlusIcon aria-hidden size={IconSize.Small} />}
          {heading.label}
        </Typography>
        {hasDiscount && discountPlan?.extraLabel && (
          <PlusPlanExtraLabel
            color={PlusLabelColor.Help}
            label={discountPlan.extraLabel}
            className="ml-3"
            typographyProps={{ color: TypographyColor.StatusHelp }}
          />
        )}
      </div>
      <div className="flex items-baseline gap-0.5">
        <Typography bold tag={TypographyTag.Span} type={TypographyType.Title1}>
          {!isPaidPlan && currency}
          {price.amount}
        </Typography>
        {hasDiscount && (
          <Typography
            type={TypographyType.Title3}
            color={TypographyColor.Quaternary}
            className="line-through"
          >
            {plan.price}
          </Typography>
        )}
      </div>
      <Typography
        color={TypographyColor.Tertiary}
        type={TypographyType.Footnote}
      >
        {price.cycle}
      </Typography>

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
          Continue
        </Button>
      ) : (
        <Button
          className="my-4 block w-full"
          href={`${plusUrl}?selectedPlan=${
            hasDiscount ? discountPlan?.value : plan?.value
          }`}
          onClick={() => {
            logSubscriptionEvent({
              event_name: LogEvent.OnboardingUpgradePlus,
              target_id: TargetId.Onboarding,
            });
          }}
          rel={anchorDefaultRel}
          tag="a"
          target="_blank"
          title="Upgrade to Plus"
          variant={ButtonVariant.Primary}
        >
          Upgrade to Plus
        </Button>
      )}
      <PlusList
        className="!py-0"
        items={features.items}
        iconProps={{ size: IconSize.Size16, className: '!mx-0' }}
        typographyProps={{
          type: TypographyType.Caption1,
          className: '!gap-1',
        }}
        badgeProps={{ className: '!px-1' }}
      />
    </li>
  );
};

interface PlusComparingCardsProps
  extends Pick<PaymentContextData, 'productOptions'> {
  currentIndex: number;
  onClickNext: () => void;
}

export const PlusComparingCards = ({
  productOptions,
  currentIndex,
  onClickNext,
}: PlusComparingCardsProps): ReactElement => {
  const productOption = productOptions[currentIndex];
  const priceFirstChar = productOption.price.at(0);
  const currency = Number.isInteger(+priceFirstChar) ? '' : priceFirstChar;

  return (
    <ul
      aria-label="Pricing plans"
      className="mx-auto grid grid-cols-1 place-content-center items-start gap-6 tablet:grid-cols-2"
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
