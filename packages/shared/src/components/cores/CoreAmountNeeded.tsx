import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { useBuyCoresContext } from '../../contexts/BuyCoresContext';

export const CoreAmountNeeded = (): ReactElement => {
  const { amountNeeded } = useBuyCoresContext();
  return (
    <>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        <Typography
          tag={TypographyTag.Span}
          color={TypographyColor.Primary}
          bold
        >
          {amountNeeded} Cores
        </Typography>{' '}
        will be used to give the Award. The remaining{' '}
        <Typography
          tag={TypographyTag.Span}
          color={TypographyColor.Primary}
          bold
        >
          80 Cores
        </Typography>{' '}
        will be added to your balance.
      </Typography>
    </>
  );
};
