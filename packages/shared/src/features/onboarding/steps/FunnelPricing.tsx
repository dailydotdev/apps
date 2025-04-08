import React, { useCallback, useState } from 'react';
import type { ReactElement } from 'react';
import type { FunnelStepPricing } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
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
import {
  FunnelBackgroundVariant,
  FunnelStepBackground,
} from '../shared/FunnelStepBackground';

const PricingSection = ({
  name,
  headline,
  pricing,
  selectedPlan,
  onPlanChange,
  cta,
  onProceedToCheckout,
}: Pick<FunnelStepPricing, 'headline' | 'pricing' | 'cta'> & {
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
        className="text-center"
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
        {cta}
      </Button>
    </div>
  );
};

export const FunnelPricing = ({
  discount,
  headline,
  pricing,
  defaultPlan,
  cta,
  featuresList,
  review,
  refund,
  faq,
  onTransition,
}: FunnelStepPricing): ReactElement => {
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan);
  const [applyDiscount, setApplyDiscount] = useState(true);

  const onProceedToCheckout = useCallback(() => {
    onTransition({
      type: FunnelStepTransitionType.Complete,
      details: { plan: selectedPlan, applyDiscount },
    });
  }, [onTransition, selectedPlan, applyDiscount]);

  const pricingProps: Omit<Parameters<typeof PricingSection>[0], 'name'> = {
    headline,
    pricing,
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
        startDate={discount.startDate}
        onTimerEnd={() => setApplyDiscount(false)}
      />
      <FunnelStepBackground variant={FunnelBackgroundVariant.Default}>
        <div className="flex flex-col gap-4 p-6">
          <PricingSection {...pricingProps} name="plan-1" />
          <CreditCards />
          <BoxList {...featuresList} />
          <ImageReview {...review} />
          <PricingSection {...pricingProps} name="plan-2" />
          <BoxContentImage {...refund} />
          <BoxFaq {...faq} />
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
            >
              support@daily.dev
            </a>
          </Typography>
        </div>
      </FunnelStepBackground>
    </>
  );
};
