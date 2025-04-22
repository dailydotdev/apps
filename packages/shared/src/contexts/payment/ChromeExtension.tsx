import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { BasePaymentProviderComponentProps } from './BasePaymentProvider';
import { BasePaymentProvider } from './BasePaymentProvider';
import type { OpenCheckoutProps } from './context';
import { webappUrl } from '../../lib/constants';

export const ChromeExtensionProvider = ({
  children,
  type,
}: BasePaymentProviderComponentProps): ReactElement => {
  const router = useRouter();
  const openCheckout = ({ priceId, giftToUserId }: OpenCheckoutProps) => {
    // Payment not available in extension
    const params = new URLSearchParams({
      priceId,
      giftToUserId: giftToUserId ?? '',
    });
    const url = new URL(`${webappUrl}plus/payment?${params.toString()}`);
    router.push(url.toString());
  };

  return (
    <BasePaymentProvider type={type} openCheckout={openCheckout}>
      {children}
    </BasePaymentProvider>
  );
};
