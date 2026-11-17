import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { useBuyCoresContext } from '../../contexts/BuyCoresContext/types';
import { useAuthContext } from '../../contexts/AuthContext';
import { formatCoresCurrency } from '../../lib/utils';

export const CoreAmountNeeded = ({
  title,
}: {
  title?: string;
}): ReactElement => {
  const { user } = useAuthContext();
  const { amountNeeded, selectedProduct } = useBuyCoresContext();
  const balance = user?.balance?.amount ?? 0;
  const missing = (amountNeeded ?? 0) - balance;

  if (!amountNeeded || missing <= 0) {
    return (
      <Typography
        className="w-full flex-1"
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        {title ?? 'Choose how many Cores to buy.'}
      </Typography>
    );
  }

  if (!selectedProduct || selectedProduct.value < missing) {
    return (
      <Typography
        className="w-full flex-1"
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        You need{' '}
        <Typography
          tag={TypographyTag.Span}
          color={TypographyColor.Primary}
          bold
        >
          {formatCoresCurrency(missing)} more Cores
        </Typography>{' '}
        to send the award.
      </Typography>
    );
  }

  return (
    <Typography
      className="w-full flex-1"
      type={TypographyType.Callout}
      color={TypographyColor.Secondary}
    >
      <Typography tag={TypographyTag.Span} color={TypographyColor.Primary} bold>
        Covers your award.
      </Typography>{' '}
      {formatCoresCurrency(amountNeeded)} Cores go to the award, and{' '}
      <Typography tag={TypographyTag.Span} color={TypographyColor.Primary} bold>
        {formatCoresCurrency(balance + selectedProduct.value - amountNeeded)}
      </Typography>{' '}
      stay in your balance.
    </Typography>
  );
};
