import React, { ReactElement } from 'react';
import {
  PaymentContextData,
  ProductOption,
} from '../../contexts/PaymentContext';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { DevPlusIcon } from '../icons';
import { Button, ButtonVariant } from '../buttons/Button';
import { defaultFeatureList, plusFeatureList, PlusList } from './PlusList';
import { IconSize } from '../Icon';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { plusUrl } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';
import { LogEvent, TargetId } from '../../lib/log';

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
      items: ['Everything on the Free plan', ...plusFeatureList],
    },
  },
};

const PlusCard = ({
  currency,
  productOption: plan,
  onClickNext,
}: PlusCardProps): ReactElement => {
  const isPaidPlan = !!plan;
  const price = {
    amount: plan?.price ?? '0',
    cycle: isPaidPlan ? `Billed ${plan?.label}` : 'Free forever',
  };
  const { logSubscriptionEvent } = usePlusSubscription();
  const currentPlan = isPaidPlan ? OnboardingPlans.Plus : OnboardingPlans.Free;
  const { heading, features } = cardContent[currentPlan];

  return (
    <div className="mx-auto w-70 max-w-full rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
      <div className="flex items-start justify-between gap-6">
        <Typography
          bold
          className="mb-1.5"
          tag={TypographyTag.H2}
          type={TypographyType.Title3}
          color={heading.color}
        >
          {heading.label}
        </Typography>
        {isPaidPlan && (
          <Typography
            className="grid aspect-square size-8 place-content-center rounded-8 bg-surface-float"
            tag={TypographyTag.Span}
            color={TypographyColor.Plus}
          >
            <DevPlusIcon />
          </Typography>
        )}
      </div>
      <div>
        <Typography bold tag={TypographyTag.Span} type={TypographyType.Title1}>
          {!isPaidPlan && currency}
          {price.amount}
        </Typography>
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Footnote}
        >
          {price.cycle}
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
          Continue
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
          title="Upgrade to Plus"
          variant={ButtonVariant.Primary}
        >
          Upgrade to Plus
        </Button>
      )}
      <PlusList
        className="!py-0"
        items={features.items}
        icon={{
          size: IconSize.XSmall,
          className: isPaidPlan ? 'text-text-tertiary' : 'text-text-quaternary',
        }}
        text={{
          type: TypographyType.Caption1,
          className: 'self-center',
        }}
      />
    </div>
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
    <div className="mx-auto grid grid-cols-1 place-content-center items-start gap-6 tablet:grid-cols-2">
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
    </div>
  );
};
