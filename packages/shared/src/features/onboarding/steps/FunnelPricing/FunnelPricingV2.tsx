import type { ReactElement } from 'react';
import React, { useEffect, useId } from 'react';
import { useAtom } from 'jotai/react';
import Head from 'next/head';
import { useAtomValue } from 'jotai';
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
  DiscountTimerReminder,
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

type PricingSelectionProps = FunnelStepPricingV2['parameters'] & {
  discountStartDate: Date | null;
};

const PricingSelection = ({
  plansBlock: { heading, plans, pricingType },
  discount,
}: PricingSelectionProps) => {
  const applyDiscount = useAtomValue(applyDiscountAtom);
  const discountStartDate = useAtomValue(discountTimerAtom);
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
    <section className="flex flex-col gap-4">
      <StepHeadline heading={heading} align={StepHeadlineAlign.Center} />
      {/* Small discount timer  */}
      {discountStartDate && applyDiscount && (
        <DiscountTimerReminder
          discountMessage={discount.message}
          durationInMinutes={discount.duration}
          startDate={discountStartDate}
          isActive
        />
      )}
      {/* pricing plans */}
    </section>
  );
};

const Pricing = ({
  onTransition,
  isActive,
  parameters,
}: FunnelStepPricingV2): ReactElement => {
  const id = useId();
  const { hero, features, plansBlock, discount, faq } = parameters;
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
        {/* Feature list */}
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
        {/* Plans */}
        <div id={`${id}-plans`}>
          <PricingSelection
            discountStartDate={discountStartDate}
            {...parameters}
          />
        </div>
        {/* Reviews */}
        {/*  reviews image */}
        <PricingSelection
          discountStartDate={discountStartDate}
          {...parameters}
        />
        {/* Text Box - FAQ version */}
        <BoxFaq items={faq.items} />
        <PricingEmailSupport />
      </div>
    </>
  );
};

export const FunnelPricingV2 = withIsActiveGuard(Pricing);

export default FunnelPricingV2;
