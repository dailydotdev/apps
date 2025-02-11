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
import type { ProductOption } from '../../contexts/PaymentContext';
import { usePaymentContext } from '../../contexts/PaymentContext';

interface PlusOptionRadioProps {
  option: ProductOption;
  checked: boolean;
  onChange?: (value: string) => void;
}

export function PlusOptionRadio({
  option,
  checked,
  onChange,
}: PlusOptionRadioProps): ReactElement {
  const { earlyAdopterPlanId } = usePaymentContext();

  if (!option) {
    return null;
  }

  const { label, value, price, currencyCode, extraLabel } = option;
  const isEarlyAccess = value === earlyAdopterPlanId;

  return (
    <RadioItem
      key={label}
      name={label}
      id={`${label}-${value}`}
      value={value}
      checked={checked}
      onChange={() => onChange(value)}
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
}
