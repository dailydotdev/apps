import React from 'react';
import type { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import { isIOSNative } from '../../lib/func';
import { PaddleSubProvider } from './Paddle';
import type { PaymentContextProviderProps } from './context';

const StoreKitSubProvider = dynamic(() =>
  import('./StoreKit').then((mod) => mod.StoreKitSubProvider),
);

export const PaymentContextProvider = ({
  children,
}: PaymentContextProviderProps): ReactElement => {
  if (isIOSNative()) {
    return <StoreKitSubProvider>{children}</StoreKitSubProvider>;
  }

  return <PaddleSubProvider>{children}</PaddleSubProvider>;
};
