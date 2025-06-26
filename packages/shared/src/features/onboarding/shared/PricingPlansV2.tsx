import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { FunnelStepPricingPlan } from '../types/steps/pricing';
import { RadioItem } from '../../../components/fields/RadioItem';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { usePaymentContext } from '../../../contexts/payment/context';
import type { ProductPricingPreview } from '../../../graphql/paddle';
import ConditionalWrapper from '../../../components/ConditionalWrapper';
import { PricingPlanVariation } from './PricingPlan';

interface PricingPlansV2Props {
  onChange?: (plan: string) => void;
  items: Array<Pick<FunnelStepPricingPlan, 'priceId' | 'label' | 'badge'>>;
  value?: string;
}

interface PricingPlanProps
  extends Pick<
    FunnelStepPricingPlan,
    'priceId' | 'label' | 'badge' | 'oldPrice' | 'variation'
  > {
  isActive?: boolean;
  onChange?: (planId: string) => void;
  price?: ProductPricingPreview;
}

const PricingPlan = ({
  isActive = false,
  onChange,
  ...plan
}: PricingPlanProps) => {
  const {
    priceId,
    variation,
    label,
    badge,
    price: productOption,
    oldPrice,
  } = plan;
  const { price } = productOption ?? {};
  const isBestValue = variation === PricingPlanVariation.BEST_VALUE;
  const currencySymbol = price.daily?.formatted?.replace(/[0-9.,\s]/g, '');
  const [firstDigit, otherDigits] = price?.daily?.formatted
    .replace(currencySymbol, '')
    .split(/\.|,/);

  return (
    <ConditionalWrapper
      condition={isBestValue}
      wrapper={(children) => (
        <div
          className={classNames(
            'rounded-16 p-1',
            isActive
              ? 'bg-gradient-funnel-best-price text-white'
              : 'bg-border-subtlest-secondary text-text-tertiary',
          )}
        >
          <Typography
            bold
            type={TypographyType.Footnote}
            className="p-1 pt-0 text-center"
          >
            BEST VALUE
          </Typography>
          {children}
        </div>
      )}
    >
      <RadioItem
        className={{
          wrapper: classNames(
            'flex flex-col gap-2 rounded-16 bg-white px-2 py-3',
            !isBestValue && 'border',
            isActive
              ? 'border-action-share-default bg-brand-float'
              : 'border-border-subtlest-secondary bg-surface-invert',
          ),
          content: 'relative z-1 flex flex-row items-center gap-2 font-normal',
        }}
        value={priceId}
        checked={isActive}
        onChange={() => onChange?.(priceId)}
      >
        {badge?.text && (
          <Typography
            type={TypographyType.Caption1}
            tag={TypographyTag.Span}
            className={classNames(
              'absolute -top-3 left-3 z-3 inline-flex -translate-y-1/2 rounded-6 px-1 text-white',
              isActive || isBestValue
                ? badge.background || 'bg-brand-default'
                : 'bg-surface-secondary',
            )}
            data-testid="plan-badge"
          >
            {badge.text}
          </Typography>
        )}
        <div className="flex-1">
          <Typography
            bold
            type={TypographyType.Body}
            tag={TypographyTag.H4}
            className={classNames(
              isActive ? 'text-black' : 'text-text-tertiary',
            )}
          >
            {label}
          </Typography>
          {!!price && (
            <>
              {oldPrice?.monthly && (
                <Typography
                  tag={TypographyTag.Del}
                  className="mr-2"
                  type={TypographyType.Footnote}
                  color={TypographyColor.Quaternary}
                >
                  {oldPrice.monthly}
                </Typography>
              )}
              <Typography
                type={TypographyType.Footnote}
                tag={TypographyTag.Span}
                className={classNames(
                  isActive ? 'text-black' : 'text-text-tertiary',
                )}
              >
                {price.monthly.formatted}
              </Typography>
            </>
          )}
        </div>
        {!!price && (
          <div
            className={classNames(
              'flex items-end justify-end gap-5',
              isActive ? 'text-black' : 'text-text-tertiary',
            )}
          >
            {oldPrice?.daily && (
              <Typography
                tag={TypographyTag.Del}
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {oldPrice.daily}
              </Typography>
            )}
            <div className="relative">
              <svg
                viewBox="0.7 0.8 19.3 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={classNames(
                  'absolute bottom-0 left-0 top-0 z-1 h-full w-auto -translate-x-full',
                  isActive ? 'text-brand-active' : 'text-surface-float',
                )}
              >
                <path
                  d="M14.8285 2.70366C15.5565 1.52067 16.8461 0.800049 18.2352 0.800049H20V52.8H18.2352C16.8461 52.8 15.5565 52.0794 14.8285 50.8964L1.29009 28.8964C0.49893 27.6108 0.49893 25.9893 1.29009 24.7037L14.8285 2.70366Z"
                  fill="currentColor"
                />
              </svg>
              <div
                className={classNames(
                  'relative z-2 flex items-center gap-1 rounded-r-8 p-1 pl-0',
                  isActive ? 'bg-brand-active' : 'bg-surface-float',
                )}
              >
                <Typography bold type={TypographyType.Callout}>
                  {currencySymbol}
                </Typography>
                <Typography
                  bold
                  type={TypographyType.Mega3}
                  tag={TypographyTag.Span}
                >
                  {firstDigit}
                </Typography>
                <div>
                  <Typography
                    className="-mb-1"
                    bold
                    type={TypographyType.Callout}
                  >
                    {otherDigits}
                  </Typography>
                  <Typography type={TypographyType.Caption2}>
                    per day
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        )}
      </RadioItem>
    </ConditionalWrapper>
  );
};

export const PricingPlansV2 = ({
  items,
  value,
  onChange,
}: PricingPlansV2Props) => {
  const { productOptions } = usePaymentContext();
  const enrichedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        price: productOptions?.find(
          (option) => option.priceId === item.priceId,
        ),
      })),
    [items, productOptions],
  );

  if (!productOptions?.length) {
    return null;
  }

  return (
    <ul aria-label="Pricing plans" className="flex flex-col gap-3">
      {enrichedItems.map((item) => (
        <PricingPlan
          isActive={value === item.priceId}
          key={item.priceId}
          onChange={onChange}
          {...item}
        />
      ))}
    </ul>
  );
};
