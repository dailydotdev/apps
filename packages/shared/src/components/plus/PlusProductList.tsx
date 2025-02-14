import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { ProductOption } from '../../contexts/PaymentContext';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { RadioItem } from '../fields/RadioItem';
import { LogEvent } from '../../lib/log';
import { usePlusSubscription } from '../../hooks';
import { PlusPriceType } from '../../lib/featureValues';
import { feature } from '../../lib/featureManagement';
import { useFeature } from '../GrowthBookProvider';

type PlusProductListProps = {
  productList: ProductOption[];
  selected?: string;
  onChange?: (value: string) => void;
  backgroundImage?: string;
  className?: string;
};

const PlusProductList = ({
  productList,
  selected,
  onChange,
  className,
}: PlusProductListProps): ReactElement => {
  const { logSubscriptionEvent } = usePlusSubscription();
  const planTypes = useFeature(feature.pricingIds);

  const earlyAdopterPlanId = useMemo(() => {
    const monthlyPrices = productList.filter(
      (option) => planTypes[option.value] === PlusPriceType.Monthly,
    );

    if (monthlyPrices.length <= 1) {
      return null;
    }

    return monthlyPrices.reduce((acc, plan) => {
      return acc.priceUnformatted < plan.priceUnformatted ? acc : plan;
    }).value;
  }, [productList, planTypes]);

  return (
    <div
      className={classNames(
        'rounded-10 border border-border-subtlest-tertiary',
        className,
      )}
    >
      {productList.map((option) => {
        const { label, value, price, currencyCode, extraLabel } = option;
        const checked = selected === value;
        const isEarlyAccess = value === earlyAdopterPlanId;
        return (
          <RadioItem
            key={label}
            name={label}
            id={`${label}-${value}`}
            value={value}
            checked={checked}
            onChange={() => {
              onChange(value);
              logSubscriptionEvent({
                event_name: LogEvent.SelectBillingCycle,
                target_id: label.toLowerCase(),
              });
            }}
            className={{
              content: classNames(
                'min-h-12 w-full rounded-10 !p-2',
                checked
                  ? '-m-px border border-border-subtlest-primary bg-surface-float'
                  : undefined,
              ),
            }}
          >
            <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Callout}
                color={TypographyColor.Primary}
              >
                {option.label}
              </Typography>

              {extraLabel && (
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption1}
                  color={
                    isEarlyAccess
                      ? TypographyColor.StatusHelp
                      : TypographyColor.StatusSuccess
                  }
                  className={classNames(
                    'rounded-10 px-2 py-1',
                    isEarlyAccess
                      ? 'whitespace-nowrap bg-action-help-float'
                      : 'bg-action-upvote-float',
                  )}
                  bold
                >
                  {extraLabel}
                </Typography>
              )}
            </div>
            <div className="ml-auto mr-1 flex items-center gap-1">
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Body}
                color={TypographyColor.Primary}
                bold
              >
                {price}
              </Typography>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
                className="font-normal"
              >
                {currencyCode}
              </Typography>
            </div>
          </RadioItem>
        );
      })}
    </div>
  );
};

export default PlusProductList;
