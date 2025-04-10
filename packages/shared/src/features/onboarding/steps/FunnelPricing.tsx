import React, { useCallback } from 'react';
import type { ReactElement } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import type { FunnelStepPricing } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import type { PricingPlansProps } from '../shared';
import {
  BoxContentImage,
  BoxFaq,
  BoxList,
  CreditCards,
  DiscountTimer,
  ImageReview,
  PricingPlans,
} from '../shared';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { anchorDefaultRel } from '../../../lib/strings';
import { usePaddlePricePreview } from '../../payment/hooks/usePaddlePricePreview';
import { usePricingCycleConverter } from '../../payment/hooks/usePricingCycleConverter';
import {
  paddleInstanceAtom,
  selectedPlanAtom,
  applyDiscountAtom,
} from '../store/funnelStore';

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

const now = new Date();

export const FunnelPricing = ({
  onTransition,
  isActive,
  discountStartDate = now,
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
  },
}: FunnelStepPricing): ReactElement => {
  const paddle = useAtomValue(paddleInstanceAtom);
  const [selectedPlan, setSelectedPlan] = useAtom(selectedPlanAtom);
  const [applyDiscount, setApplyDiscount] = useAtom(applyDiscountAtom);

  if (!selectedPlan && defaultPlan) {
    setSelectedPlan(defaultPlan);
  }

  const { data: pricePreview } = usePaddlePricePreview({
    priceIds: plans?.map((plan) => plan.priceId),
    paddle,
  });

  const pricingCycleConverter = usePricingCycleConverter({
    pricePreview,
  });

  const onProceedToCheckout = useCallback(() => {
    onTransition({
      type: FunnelStepTransitionType.Complete,
      details: { plan: selectedPlan, applyDiscount },
    });
  }, [onTransition, selectedPlan, applyDiscount]);

  const pricingProps: Omit<Parameters<typeof PricingSection>[0], 'name'> = {
    headline,
    pricing: {
      perks,
      plans: plans?.map((plan, index) => ({
        ...plan,
        value: plan.priceId,
        price: {
          amount: pricingCycleConverter?.[index]?.price,
          subtitle: 'per day',
        },
      })),
    },
    selectedPlan,
    onPlanChange: setSelectedPlan,
    onProceedToCheckout,
    cta,
  };

  return (
    <>
      <DiscountTimer
        discountMessage={discount.message}
        durationInMinutes={discount.duration}
        startDate={discountStartDate}
        onTimerEnd={() => setApplyDiscount(false)}
        isActive={isActive}
      />
      <div className="flex flex-col gap-4 p-6">
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
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="text-center"
        >
          For technical or product related questions click here or email us at{' '}
          <a
            href="mailto:support@daily.dev"
            className="text-text-link underline"
            target="_blank"
            rel={anchorDefaultRel}
          >
            support@daily.dev
          </a>
        </Typography>
      </div>
    </>
  );
};
