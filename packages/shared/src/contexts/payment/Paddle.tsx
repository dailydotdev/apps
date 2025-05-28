import type { ReactElement } from 'react';
import React from 'react';
import type { CheckoutEventNames, PaddleEventData } from '@paddle/paddle-js';
import { usePaddlePayment } from '../../hooks/usePaddlePayment';
import type { PaymentContextProviderProps } from './context';
import { BasePaymentProvider } from './BasePaymentProvider';
import { TargetType } from '../../lib/log';

export type PaddleSubProviderProps = PaymentContextProviderProps<
  PaddleEventData,
  CheckoutEventNames
>;

export const PaddleSubProvider = ({
  children,
  successCallback,
  disabledEvents,
}: PaddleSubProviderProps): ReactElement => {
  const { openCheckout, isPaddleReady } = usePaddlePayment({
    successCallback,
    disabledEvents,
    targetType: TargetType.Plus,
  });

  return (
    <BasePaymentProvider
      openCheckout={openCheckout}
      isPaddleReady={isPaddleReady}
    >
      {children}
    </BasePaymentProvider>
  );
};
