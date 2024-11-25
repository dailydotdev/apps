import React, { FC } from 'react';
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
import { plusUrl } from '../../lib/constants';
import { defaultFeatureList, plusFeatureList, PlusList } from './PlusList';
import { IconSize } from '../Icon';
import { anchorDefaultRel } from '../../lib/strings';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';

export enum OnboardingPlans {
  Free = 'Free',
  Plus = 'Plus',
}

interface PlusCardProps {
  currency: string;
  onClickNext: () => void;
  productOption?: ProductOption;
}

const PlusCard: FC<PlusCardProps> = ({
  currency,
  productOption: plan,
  onClickNext,
}) => {
  const isPaidPlan = !!plan;
  const price = plan?.price ?? '0';
  const billingLabel = isPaidPlan ? `Billed ${plan?.label}` : 'Free forever';
  const { logSubscriptionEvent } = usePlusSubscription();

  return (
    <div className="mx-auto w-70 max-w-full rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
      <div className="flex items-start justify-between gap-6">
        <Typography
          bold
          className="mb-1.5"
          tag={TypographyTag.H2}
          type={TypographyType.Title3}
          color={isPaidPlan ? TypographyColor.Plus : TypographyColor.Primary}
        >
          {isPaidPlan ? 'Plus' : 'Free'}
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
          {price}
        </Typography>
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Footnote}
        >
          {billingLabel}
        </Typography>
      </div>
      {!isPaidPlan ? (
        <Button
          className="my-4 block w-full"
          onClick={() => {
            logSubscriptionEvent({
              event_name: 'skip upgrade subscription',
              target_id: 'onboarding',
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
          href={plusUrl}
          rel={anchorDefaultRel}
          tag="a"
          target="_blank"
          title="Upgrade to Plus"
          variant={ButtonVariant.Primary}
          onClick={() => {
            logSubscriptionEvent({
              event_name: 'upgrade subscription',
              target_id: 'onboarding',
            });
          }}
        >
          Upgrade to Plus
        </Button>
      )}
      <PlusList
        className="!py-0"
        items={
          isPaidPlan
            ? ['Everything on the Free plan', ...plusFeatureList]
            : defaultFeatureList
        }
        icon={{ size: IconSize.XSmall }}
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

export const PlusComparingCards: FC<PlusComparingCardsProps> = ({
  productOptions,
  currentIndex,
  onClickNext,
}) => {
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
