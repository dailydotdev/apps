import React, { useCallback, useEffect } from 'react';
import type { ReactElement } from 'react';
import { useAtom } from 'jotai';
import type { FunnelStepPricingV1 } from '../../types/funnel';
import {
  FunnelStepTransitionType,
  FunnelPricingType,
} from '../../types/funnel';
import type { PricingPlansProps } from '../../shared';
import {
  BoxContentImage,
  BoxFaq,
  BoxList,
  CreditCards,
  DiscountTimer,
  ImageReview,
  PricingPlans,
} from '../../shared';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  selectedPlanAtom,
  applyDiscountAtom,
  discountTimerAtom,
} from '../../store/funnel.store';
import { usePaymentContext } from '../../../../contexts/payment/context';
import type { BaseProductPricingPreview } from '../../../../graphql/paddle';
import { PricingEmailSupport } from './common';

const PricingSection = ({
  name,
  headline,
  pricing,
  selectedPlan,
  onPlanChange,
  cta,
  onProceedToCheckout,
}: {
  cta: string;
  headline: string;
  pricing: Pick<PricingPlansProps, 'plans' | 'perks'>;
  selectedPlan: string;
  onPlanChange: (plan: string) => void;
  onProceedToCheckout: () => void;
  name: string;
}): ReactElement => {
  return (
    <div className="flex flex-col gap-4">
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Title1}
        className="text-center font-bold"
      >
        {headline}
      </Typography>
      <PricingPlans
        name={name}
        plans={pricing.plans}
        value={selectedPlan}
        onChange={onPlanChange}
        perks={pricing.perks}
      />
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        color={ButtonColor.Avocado}
        className="w-full"
        onClick={onProceedToCheckout}
      >
        {cta || 'Proceed to checkout →'}
      </Button>
    </div>
  );
};

export const getPricing = (
  pricing: BaseProductPricingPreview,
  pricingType: FunnelPricingType,
): {
  amount: string;
  subtitle: string;
} => {
  if (pricingType === FunnelPricingType.Monthly) {
    return {
      amount: pricing.price.monthly.formatted,
      subtitle: 'per month',
    };
  }

  return {
    amount: pricing.price.daily.formatted,
    subtitle: 'per day',
  };
};

export const FunnelPricingV1 = ({
  onTransition,
  isActive,
  parameters: {
    discount,
    headline,
    plans,
    defaultPlan,
    perks,
    cta,
    featuresList,
    review,
    refund,
    faq,
    pricingType,
  },
}: FunnelStepPricingV1): ReactElement => {
  const [selectedPlan, setSelectedPlan] = useAtom(selectedPlanAtom);
  const [applyDiscount, setApplyDiscount] = useAtom(applyDiscountAtom);
  const [discountStartDate, setTimer] = useAtom(discountTimerAtom);

  if (!selectedPlan && defaultPlan) {
    setSelectedPlan(defaultPlan);
  }

  const { productOptions } = usePaymentContext();

  const onProceedToCheckout = useCallback(() => {
    onTransition({
      type: FunnelStepTransitionType.Complete,
      details: { plan: selectedPlan, applyDiscount },
    });
  }, [onTransition, selectedPlan, applyDiscount]);

  const organizedPlans = plans?.map((plan) => {
    const pricing = productOptions?.find(
      (option) => option?.priceId === plan.priceId,
    );

    if (!pricing) {
      return null;
    }

    return {
      ...plan,
      value: plan.priceId,
      price: getPricing(pricing, pricingType),
    };
  });

  const pricingProps: Omit<Parameters<typeof PricingSection>[0], 'name'> = {
    headline,
    pricing: {
      perks,
      plans: organizedPlans.filter(Boolean),
    },
    selectedPlan,
    onPlanChange: setSelectedPlan,
    onProceedToCheckout,
    cta,
  };

  useEffect(() => {
    if (isActive && !discountStartDate) {
      setTimer(new Date());
    }
  }, [isActive, discountStartDate, setTimer]);

  return (
    <>
      {!!discountStartDate && (
        <DiscountTimer
          discountMessage={discount.message}
          durationInMinutes={discount.duration}
          startDate={discountStartDate}
          onTimerEnd={() => setApplyDiscount(false)}
          isActive={isActive}
        />
      )}
      <div className="flex flex-col gap-4 px-4 py-6">
        <PricingSection {...pricingProps} name="plan-1" />
        <CreditCards />
        <BoxList {...featuresList} />
        <ImageReview {...review} />
        <PricingSection {...pricingProps} name="plan-2" />
        <BoxContentImage
          title={refund.title}
          content={refund.content}
          image={{ src: refund.image, alt: 'Checkmark' }}
        />
        <BoxFaq items={faq} />
        <PricingEmailSupport />
      </div>
    </>
  );
};
