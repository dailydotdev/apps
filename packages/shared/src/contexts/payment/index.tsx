import React from 'react';
import type { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import { isIOSNative } from '../../lib/func';
import type { PaymentContextProviderProps } from './context';

const StoreKitSubProvider = dynamic(() =>
  import('./StoreKit').then((mod) => mod.StoreKitSubProvider),
);

const PaddleSubProvider = dynamic(() =>
  import('./Paddle').then((mod) => mod.PaddleSubProvider),
);

export const PaymentContextProvider = ({
  children,
}: PaymentContextProviderProps): ReactElement => {
  if (isIOSNative()) {
    return <StoreKitSubProvider>{children}</StoreKitSubProvider>;
  }

  return <PaddleSubProvider>{children}</PaddleSubProvider>;
};
