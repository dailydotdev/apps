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
  ...props
}: PaymentContextProviderProps): ReactElement => {
  if (isIOSNative()) {
    return <StoreKitSubProvider {...props}>{children}</StoreKitSubProvider>;
  }

  if (checkIsExtension()) {
    return (
      <ChromeExtensionProvider {...props}>{children}</ChromeExtensionProvider>
    );
  }

  return <PaddleSubProvider {...props}>{children}</PaddleSubProvider>;
};
