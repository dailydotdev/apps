import type { PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import { BasePaymentProvider } from './BasePaymentProvider';

export const ChromeExtensionProvider = ({
  children,
}: PropsWithChildren): ReactElement => {
  // No-op function since checkout is not available in extension
  const openCheckout = () => {
    // Payment not available in extension
  };

  return (
    <BasePaymentProvider openCheckout={openCheckout}>
      {children}
    </BasePaymentProvider>
  );
};
