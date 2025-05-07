import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { useBuyCoresContext } from '../../contexts/BuyCoresContext/types';
import { formatCoresCurrency } from '../../lib/utils';

export const CoreAmountNeeded = (): ReactElement => {
  const { amountNeeded, selectedProduct } = useBuyCoresContext();

  if (!amountNeeded || !selectedProduct) {
    return (
      <Typography
        className="w-full flex-1"
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        Choose how many Cores to buy.
      </Typography>
    );
  }

  return (
    <>
      <Typography
        className="w-full flex-1"
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        <Typography
          tag={TypographyTag.Span}
          color={TypographyColor.Primary}
          bold
        >
          {formatCoresCurrency(amountNeeded)} Cores
        </Typography>{' '}
        will be used to give the Award. The remaining{' '}
        <Typography
          tag={TypographyTag.Span}
          color={TypographyColor.Primary}
          bold
        >
          {formatCoresCurrency(selectedProduct.value - amountNeeded)} Cores
        </Typography>{' '}
        will be added to your balance.
      </Typography>
    </>
  );
};
