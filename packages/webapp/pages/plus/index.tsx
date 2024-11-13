import React, { ReactElement, useCallback, useState } from 'react';
import { usePaymentContext } from '@dailydotdev/shared/src/contexts/PaymentContext';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { PlusList } from '@dailydotdev/shared/src/components/plus/PlusList';
import { RadioItem } from '@dailydotdev/shared/src/components/fields/RadioItem';
import classNames from 'classnames';
import { plusInfo } from '@dailydotdev/shared/src/lib/constants';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { getPlusLayout } from '../../components/layouts/PlusLayout/PlusLayout';

const PlusPage = (): ReactElement => {
  const { openCheckout, productPrices } = usePaymentContext();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const productOptions =
    productPrices?.data?.details?.lineItems?.map((item) => ({
      label: item.price.description,
      value: item.price.id,
      price: item.formattedTotals.total,
      currencyCode: productPrices?.data.currencyCode,
      extraLabel: item.price.customData?.label,
    })) ?? [];

  if (productOptions?.[0]?.value && !selectedOption) {
    setSelectedOption(productOptions?.[0]?.value);
    openCheckout({ priceId: productOptions?.[0]?.value });
  }

  const toggleCheckoutOption = useCallback(
    (priceId) => {
      setSelectedOption(priceId);
      openCheckout({ priceId });
    },
    [openCheckout],
  );

  return (
    <div className="flex flex-1 items-center justify-center gap-20">
      <div className="ml-6 flex w-[28.5rem] flex-col">
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.Mega2}
          color={TypographyColor.Primary}
          className="mb-2"
          bold
        >
          Unlock more with Plus
        </Typography>
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title3}
          color={TypographyColor.Secondary}
          className="mb-6"
        >
          Upgrade to daily.dev Plus for an enhanced, ad-free experience with
          exclusive features and perks to level up your game.
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="mb-4"
          bold
        >
          Billing cycle
        </Typography>
        <div className="rounded-10 border border-border-subtlest-tertiary ">
          {productOptions.map((option) => {
            const { label, value, price, currencyCode, extraLabel } = option;
            const checked = selectedOption === value;
            return (
              <div
                key={label}
                className={classNames(
                  'flex h-12 items-center justify-between rounded-10 p-2',
                  checked
                    ? 'border border-border-subtlest-primary bg-surface-float'
                    : undefined,
                )}
              >
                <div className="flex items-center">
                  <RadioItem
                    name={label}
                    id={`${label}-${value}`}
                    value={value}
                    checked={checked}
                    onChange={() => toggleCheckoutOption(value)}
                    className={{
                      content: 'truncate',
                    }}
                  >
                    <Typography
                      tag={TypographyTag.Span}
                      type={TypographyType.Callout}
                      color={TypographyColor.Primary}
                    >
                      {option.label}
                    </Typography>
                  </RadioItem>
                  {extraLabel ? (
                    <Typography
                      tag={TypographyTag.Span}
                      type={TypographyType.Caption1}
                      color={TypographyColor.Plus}
                      className="bg-action-plus-float rounded-10 px-2 py-1"
                      bold
                    >
                      {extraLabel}
                    </Typography>
                  ) : undefined}
                </div>
                <div className="mr-1 flex items-center gap-1">
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
                  >
                    {currencyCode}
                  </Typography>
                </div>
              </div>
            );
          })}
        </div>
        <PlusList />
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Still on the fence?{' '}
          <a
            className="text-text-link hover:underline"
            href={plusInfo}
            target="_blank"
            rel={anchorDefaultRel}
          >
            See what’s inside!
          </a>
        </Typography>
      </div>
      <div className="checkout-container mr-6 min-h-40 w-[28.5rem] rounded-16 bg-background-default p-5" />
    </div>
  );
};

PlusPage.getLayout = getPlusLayout;

export default PlusPage;
