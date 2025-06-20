import type { ReactElement } from 'react';
import React, { useEffect, useId } from 'react';
import { useAtom } from 'jotai/react';
import Head from 'next/head';
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
  DiscountTimerVariant,
  StepHeadline,
  StepHeadlineAlign,
} from '../../shared';
import { PricingEmailSupport } from './common';
import { LazyImage } from '../../../../components/LazyImage';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { ChecklistAIcon } from '../../../../components/icons';

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
  isActive,
  parameters: { discount, hero, features, plansBlock, faq },
}: FunnelStepPricingV2): ReactElement => {
  const id = useId();
  const [applyDiscount, setApplyDiscount] = useAtom(applyDiscountAtom);
  const [discountStartDate, setTimer] = useAtom(discountTimerAtom);

  useEffect(() => {
    if (isActive && !discountStartDate) {
      setTimer(new Date());
    }
  }, [isActive, discountStartDate, setTimer]);

  return (
    <>
      {/* Add a new style variant with CTA  */}
      {!!discountStartDate && applyDiscount && (
        <DiscountTimer
          className="bg-brand-default text-white"
          discountMessage={discount.message}
          durationInMinutes={discount.duration}
          isActive
          onTimerEnd={() => setApplyDiscount(false)}
          startDate={discountStartDate}
          variant={DiscountTimerVariant.WithSlot}
        >
          <Button
            className=" bg-white text-black"
            href={`#${id}-plans`}
            size={ButtonSize.Medium}
            tag="a"
            variant={ButtonVariant.Float}
          >
            {plansBlock.cta}
          </Button>
        </DiscountTimer>
      )}
      <div className="flex flex-col gap-6 px-4 py-6">
        {/* Hero */}
        {hero.image && (
          <>
            <Head>
              <link rel="preload" as="image" href={hero.image} />
            </Head>
            <LazyImage
              aria-hidden
              eager
              imgSrc={hero.image}
              className="h-auto w-full object-center"
              fit="contain"
              ratio="64%"
              imgAlt="Supportive illustration for the information"
            />
          </>
        )}
        <StepHeadline
          heading={hero.headline}
          description={hero.explainer}
          align={StepHeadlineAlign.Center}
          className="!gap-3"
        />

        {/* Add bg style */}
        <BoxList
          className="!bg-brand-float px-6 py-8"
          items={features.items}
          title={features.heading}
          icon={{ Component: ChecklistAIcon, className: 'text-brand-default' }}
          typographyClasses={{
            title: 'font-bold typo-title2 text-center',
            listItem: 'typo-body',
          }}
        />
        <div id={`${id}-plans`} />
        <PricingSelection {...plansBlock} />
        {/* Reviews */}
        {/*  reviews image */}
        <PricingSelection {...plansBlock} />
        {/* Text Box - FAQ version */}
        <BoxFaq items={faq.items} />
        <PricingEmailSupport />
      </div>
    </>
  );
};

export const FunnelPricingV2 = withIsActiveGuard(Pricing);

export default FunnelPricingV2;
