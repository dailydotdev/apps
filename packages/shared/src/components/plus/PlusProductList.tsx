import type { ReactElement } from 'react';
import React from 'react';
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

  return (
    <div
      className={classNames(
        'rounded-10 border border-border-subtlest-tertiary',
        className,
      )}
    >
      {productList.map(({ label, value, price, currencyCode, extraLabel }) => (
        <RadioItem
          key={label}
          name={label}
          id={`${label}-${value}`}
          value={value}
          checked={selected === value}
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
              selected === value
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
              {label}
            </Typography>

            {extraLabel && (
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                color={TypographyColor.StatusSuccess}
                className={classNames(
                  'rounded-10 px-2 py-1',
                  'bg-action-upvote-float',
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
              {price.formatted}
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
      ))}
    </div>
  );
};

export default PlusProductList;
