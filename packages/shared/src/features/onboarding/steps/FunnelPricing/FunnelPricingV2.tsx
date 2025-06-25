import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useId } from 'react';
import { useAtom } from 'jotai/react';
import Head from 'next/head';
import { useAtomValue } from 'jotai';
import type { FunnelStepPricingV2 } from '../../types/funnel';
import { FunnelStepTransitionType } from '../../types/funnel';
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
  CreditCards,
  BoxReviews,
  BoxContentImage,
} from '../../shared';
import { PricingEmailSupport } from './common';
import { LazyImage } from '../../../../components/LazyImage';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { ChecklistAIcon, ShieldCheckIcon } from '../../../../components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { PricingPlansV2 } from '../../shared/PricingPlansV2';

type PricingSelectionProps = FunnelStepPricingV2['parameters'] & {
  discountStartDate: Date | null;
  onProceedToCheckout?: (plan: string) => void;
};

const PricingSelection = ({
  discount,
  onProceedToCheckout,
  plansBlock: { cta, ctaMessage, heading, plans, timer },
}: PricingSelectionProps) => {
  const applyDiscount = useAtomValue(applyDiscountAtom);
  const discountStartDate = useAtomValue(discountTimerAtom);
  const [selectedPlan, setSelectedPlan] = useAtom(selectedPlanAtom);

  return (
    <section className="flex flex-col gap-4">
      <StepHeadline heading={heading} align={StepHeadlineAlign.Center} />
      {/* Small discount timer  */}
      {discountStartDate && applyDiscount && (
        <DiscountTimerReminder
          discountMessage={timer.message}
          durationInMinutes={discount.duration}
          startDate={discountStartDate}
          isActive
        />
      )}
      <PricingPlansV2
        onChange={setSelectedPlan}
        value={selectedPlan}
        items={plans}
      />
      <Typography
        className="text-center"
        color={TypographyColor.Primary}
        type={TypographyType.Callout}
      >
        {ctaMessage}
      </Typography>
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        color={ButtonColor.Cabbage}
        className="w-full"
        onClick={() => onProceedToCheckout?.(selectedPlan)}
      >
        {cta || 'Get my plan'}
      </Button>
      <CreditCards>
        <Typography
          className="mb-4 flex gap-1 rounded-8 bg-surface-float px-2 py-0.5"
          type={TypographyType.Callout}
        >
          <ShieldCheckIcon aria-hidden />
          Pay safe & secure
        </Typography>
      </CreditCards>
    </section>
  );
};

const Pricing = ({
  onTransition,
  isActive,
  parameters,
}: FunnelStepPricingV2): ReactElement => {
  const id = useId();
  const { hero, features, plansBlock, discount, faq, trust, refund, reviews } =
    parameters;
  const [applyDiscount, setApplyDiscount] = useAtom(applyDiscountAtom);
  const [discountStartDate, setTimer] = useAtom(discountTimerAtom);

  useEffect(() => {
    if (isActive && !discountStartDate) {
      setTimer(new Date());
    }
  }, [isActive, discountStartDate, setTimer]);

  const onProceedToCheckout = useCallback(
    (plan) => {
      onTransition({
        type: FunnelStepTransitionType.Complete,
        details: { plan, applyDiscount },
      });
    },
    [onTransition, applyDiscount],
  );

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
            onProceedToCheckout={onProceedToCheckout}
            {...parameters}
          />
        </div>
        {/* Refund */}
        <BoxContentImage
          title={refund.title}
          content={refund.content}
          image={{ src: refund.image, alt: 'Checkmark' }}
          className="border-0 !bg-action-upvote-float"
          typographyClasses={{
            title: 'typo-title2 font-bold',
            content: 'typo-callout text-text-tertiary',
          }}
        />
        {/* Review */}
        <BoxReviews className="!bg-action-bookmark-active" {...reviews} />
        {/* Image */}
        {!!trust.image && (
          <LazyImage
            eager
            imgSrc={trust.image}
            imgAlt="Social proof image"
            className="w-full rounded-16"
            ratio="100%"
            fit="cover"
          />
        )}
        {/* Plans pt.2 */}
        <PricingSelection
          discountStartDate={discountStartDate}
          onProceedToCheckout={onProceedToCheckout}
          {...parameters}
        />
        {/* Refund pt.2 */}
        <BoxContentImage
          title={refund.title}
          content={refund.content}
          image={{ src: refund.image, alt: 'Checkmark' }}
          className="border-0 !bg-action-upvote-float"
          typographyClasses={{
            title: 'typo-title2 font-bold',
            content: 'typo-callout text-text-tertiary',
          }}
        />
        {/* FAQs */}
        <BoxFaq className="border-0" items={faq.items} />
        {/* Contact support */}
        <PricingEmailSupport />
      </div>
    </>
  );
};

export const FunnelPricingV2 = withIsActiveGuard(Pricing);

export default FunnelPricingV2;
