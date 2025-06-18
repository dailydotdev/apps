import type { ReactElement } from 'react';
import React, { useId } from 'react';
import { useAtom } from 'jotai/react';
import type { FunnelStepPricingV2 } from '../../types/funnel';
import { withIsActiveGuard } from '../../shared/withActiveGuard';
import {
  applyDiscountAtom,
  discountTimerAtom,
  selectedPlanAtom,
} from '../../store/funnel.store';
import {
  BoxFaq,
  BoxList,
  DiscountTimer,
  StepHeadline,
  StepHeadlineAlign,
} from '../../shared';
import { PricingEmailSupport } from './common';

type PricingSelectionProps = FunnelStepPricingV2['parameters']['plansBlock'];

const PricingSelection = ({
  heading,
  plans,
  pricingType,
}: PricingSelectionProps) => {
  const [selectedPlan, setSelectedPlan] = useAtom(selectedPlanAtom);
  const id = useId();
  /*
  Pricing selection section with
    - Title
    - Small discount timer
    - Pricing section with new design
    - CTA button
    - Pay safe and secure
    - Money back - text box
  */
  return (
    <section>
      <StepHeadline heading={heading} align={StepHeadlineAlign.Center} />
      {/* Small discount timer  */}
      {/* pricing plans */}
    </section>
  );
};

const Pricing = ({
  onTransition,
  parameters: { discount, hero, features, plansBlock, faq },
}: FunnelStepPricingV2): ReactElement => {
  const [applyDiscount, setApplyDiscount] = useAtom(applyDiscountAtom);
  const [discountStartDate, setTimer] = useAtom(discountTimerAtom);

  return (
    <>
      {/* Add a new style variant with CTA  */}
      {!!discountStartDate && (
        <DiscountTimer
          discountMessage={discount.message}
          durationInMinutes={discount.duration}
          startDate={discountStartDate}
          onTimerEnd={() => setApplyDiscount(false)}
          isActive
        />
      )}
      {/* Image */}
      <StepHeadline
        heading={hero.headline}
        description={hero.explainer}
        align={StepHeadlineAlign.Center}
      />
      {/* Add bg style */}
      <BoxList items={features.items} title={features.heading} />

      <PricingSelection {...plansBlock} />
      {/* Reviews */}
      {/*  reviews image */}
      <PricingSelection {...plansBlock} />
      {/* Text Box - FAQ version */}
      <BoxFaq items={faq.items} />
      <PricingEmailSupport />
    </>
  );
};

export const FunnelPricingV2 = withIsActiveGuard(Pricing);

export default FunnelPricingV2;
