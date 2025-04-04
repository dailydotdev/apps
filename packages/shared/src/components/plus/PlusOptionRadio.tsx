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
import type { PlusPricingPreview } from '../../graphql/paddle';
import { captionToColor, captionToTypographyColor } from './PlusPlanExtraLabel';

interface PlusOptionRadioProps {
  option: PlusPricingPreview;
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

  const { metadata, productId, price } = option;
  const finalPrice = shouldShowMonthlyPrice
    ? price.monthly?.formatted || price.formatted
    : price.formatted;

  return (
    <RadioItem
      key={productId}
      name={metadata.title}
      id={`${metadata.title}-${productId}`}
      value={productId}
      checked={checked}
      onChange={() => onChange(productId)}
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
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={captionToTypographyColor[metadata.caption.color]}
            className={classNames(
              'rounded-10 px-2 py-1',
              captionToColor[metadata.caption.color],
            )}
            bold
          >
            {metadata.caption.copy}
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
