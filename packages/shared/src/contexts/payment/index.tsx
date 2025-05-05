import React from 'react';
import type { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import { checkIsExtension } from '../../lib/func';
import type { PaddleSubProviderProps } from './Paddle';
import { PaddleSubProvider } from './Paddle';
import { ChromeExtensionProvider } from './ChromeExtension';
import type { PaymentContextProviderProps } from './context';
import type { StoreKitSubProviderProps } from './StoreKit';
import { iOSSupportsPlusPurchase } from '../../lib/ios';

const StoreKitSubProvider = dynamic(() =>
  import('./StoreKit').then((mod) => mod.StoreKitSubProvider),
);

export const PaymentContextProvider = ({
  children,
  ...props
}: PaymentContextProviderProps): ReactElement => {
  if (iOSSupportsPlusPurchase()) {
    return (
      <StoreKitSubProvider {...(props as StoreKitSubProviderProps)}>
        {children}
      </StoreKitSubProvider>
    );
  }

  if (checkIsExtension()) {
    return (
      <ChromeExtensionProvider {...props}>{children}</ChromeExtensionProvider>
    );
  }

  return (
    <PaddleSubProvider {...(props as PaddleSubProviderProps)}>
      {children}
    </PaddleSubProvider>
  );
};
