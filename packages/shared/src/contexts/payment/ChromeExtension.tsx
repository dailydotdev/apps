import type { PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { BasePaymentProvider } from './BasePaymentProvider';
import type { OpenCheckoutProps } from './context';
import { webappUrl } from '../../lib/constants';

export const ChromeExtensionProvider = ({
  children,
}: PropsWithChildren): ReactElement => {
  const router = useRouter();
  const openCheckout = ({
    priceId,
    giftToUserId,
    discountId,
  }: OpenCheckoutProps) => {
    // Payment not available in extension
    const params = new URLSearchParams({ priceId });

    if (giftToUserId) {
      params.append('giftToUserId', giftToUserId);
    }
    if (discountId) {
      params.append('discountId', discountId);
    }

    const url = new URL(`${webappUrl}plus/payment?${params.toString()}`);
    router.push(url.toString());
  };

  return (
    <BasePaymentProvider openCheckout={openCheckout}>
      {children}
    </BasePaymentProvider>
  );
};
