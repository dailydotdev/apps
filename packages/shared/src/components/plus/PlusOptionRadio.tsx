import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { RadioItem } from '../fields/RadioItem';
import type { ProductPricingPreview } from '../../graphql/paddle';
import { PlusPlanExtraLabel } from './PlusPlanExtraLabel';

interface PlusOptionRadioProps {
  option: ProductPricingPreview;
  checked: boolean;
  onChange?: (value: string) => void;
  shouldShowMonthlyPrice?: boolean;
  shoouldShowDuration?: boolean;
}

export function PlusOptionRadio({
  option,
  checked,
  onChange,
  shouldShowMonthlyPrice,
  shoouldShowDuration,
}: PlusOptionRadioProps): ReactElement {
  if (!option) {
    return null;
  }

  const { metadata, priceId, price } = option;
  const finalPrice = shouldShowMonthlyPrice
    ? price.monthly?.formatted || price.formatted
    : price.formatted;

  return (
    <RadioItem
      key={priceId}
      name={metadata.title}
      id={`${metadata.title}-${priceId}`}
      value={priceId}
      checked={checked}
      onChange={() => onChange(priceId)}
      className={{
        content: classNames(
          'min-h-12 rounded-10 !p-2',
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
          {metadata.title}
        </Typography>

        {metadata.caption && (
          <PlusPlanExtraLabel
            color={metadata.caption.color}
            label={metadata.caption.copy}
          />
        )}
      </div>
      <div className="ml-auto mr-1 flex items-center gap-1">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          bold
        >
          {finalPrice}
        </Typography>
        {option.currency && (
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Body}
            color={TypographyColor.Secondary}
            className="font-normal"
          >
            {option.currency.code}
          </Typography>
        )}
        {shoouldShowDuration && (
          <Typography
            className="font-normal"
            color={TypographyColor.Quaternary}
            type={TypographyType.Footnote}
          >
            /{shouldShowMonthlyPrice ? 'month' : 'yearly'}
          </Typography>
        )}
      </div>
    </RadioItem>
  );
}
