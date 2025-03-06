import React from 'react';
import type { ReactElement } from 'react';
import { isIOSNative } from '../../lib/func';
import { PaddleSubProvider } from './Paddle';
import type { PaymentContextProviderProps } from './context';
import { StoreKitSubProvider } from './StoreKit';

export const PaymentContextProvider = ({
  children,
}: PaymentContextProviderProps): ReactElement => {
  if (isIOSNative()) {
    return <StoreKitSubProvider>{children}</StoreKitSubProvider>;
  }

  return <PaddleSubProvider>{children}</PaddleSubProvider>;
};
