import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { CheckoutEventNames, PaddleEventData } from '@paddle/paddle-js';
import { usePaddlePayment } from '../../hooks/usePaddlePayment';
import type { PaymentContextProviderProps } from './context';
import { BasePaymentProvider } from './BasePaymentProvider';
import { PurchaseType } from '../../graphql/paddle';

export type PaddleSubProviderProps = PaymentContextProviderProps<
  PaddleEventData,
  CheckoutEventNames
>;

export const PaddleSubProvider = ({
  children,
  successCallback,
  disabledEvents,
  initialPriceType = PurchaseType.Plus,
}: PaddleSubProviderProps): ReactElement => {
  const [priceType, setPriceType] = useState(initialPriceType);

  const { openCheckout, isPaddleReady, checkoutItemsLoading } =
    usePaddlePayment({
      successCallback,
      disabledEvents,
      priceType,
    });

  return (
    <BasePaymentProvider
      openCheckout={openCheckout}
      isPaddleReady={isPaddleReady}
      checkoutItemsLoading={checkoutItemsLoading}
      priceType={priceType}
      setPriceType={setPriceType}
    >
      {children}
    </BasePaymentProvider>
  );
};
