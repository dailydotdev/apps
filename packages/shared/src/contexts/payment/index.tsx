import React from 'react';
import type { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import { isIOSNative, checkIsExtension } from '../../lib/func';
import { PaddleSubProvider } from './Paddle';
import { ChromeExtensionProvider } from './ChromeExtension';
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

  if (checkIsExtension()) {
    return <ChromeExtensionProvider>{children}</ChromeExtensionProvider>;
  }

  return <PaddleSubProvider>{children}</PaddleSubProvider>;
};
