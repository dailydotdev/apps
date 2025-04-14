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
  successCallback,
}: PaymentContextProviderProps): ReactElement => {
  if (isIOSNative()) {
    return (
      <StoreKitSubProvider successCallback={successCallback}>
        {children}
      </StoreKitSubProvider>
    );
  }

  return (
    <PaddleSubProvider successCallback={successCallback}>
      {children}
    </PaddleSubProvider>
  );
};
