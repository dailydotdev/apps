import type { ReactElement } from 'react';
import React from 'react';
import type { CheckoutEventNames } from '@paddle/paddle-js';
import { usePaddlePayment } from '../../hooks/usePaddlePayment';
import type { PaymentContextProviderProps } from './context';
import { BasePaymentProvider } from './BasePaymentProvider';

export type PaddleSubProviderProps =
  PaymentContextProviderProps<CheckoutEventNames>;

export const PaddleSubProvider = ({
  children,
  successCallback,
}: PaymentContextProviderProps): ReactElement => {
  const { openCheckout } = usePaddlePayment({ successCallback });

  return (
    <BasePaymentProvider openCheckout={openCheckout}>
      {children}
    </BasePaymentProvider>
  );
};
