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

export const CoreAmountNeeded = ({
  title,
}: {
  title?: string;
}): ReactElement => {
  const { amountNeeded, selectedProduct, minCoresToBuy } = useBuyCoresContext();

  if (!amountNeeded || !selectedProduct) {
    const defaultTitle = minCoresToBuy
      ? `You need ${formatCoresCurrency(minCoresToBuy)} more Cores.`
      : 'Choose how many Cores to buy.';

    return (
      <Typography
        className="w-full flex-1"
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        {title ?? defaultTitle}
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
