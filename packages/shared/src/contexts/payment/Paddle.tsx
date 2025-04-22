import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import type { PaddleEventData } from '@paddle/paddle-js';
import { CheckoutEventNames } from '@paddle/paddle-js';
import { useRouter } from 'next/router';
import type { OpenCheckoutProps, PaymentContextProviderProps } from './context';
import { BasePaymentProvider } from './BasePaymentProvider';
import { plusSuccessUrl } from '../../lib/constants';
import { useAuthContext } from '../AuthContext';
import { usePaddle } from '../../features/payment/hooks/usePaddle';

const useDefaultCallback = (successCallback: () => void) => {
  const router = useRouter();

  return useCallback(
    (event: PaddleEventData) => {
      switch (event?.name) {
        case CheckoutEventNames.CHECKOUT_COMPLETED:
          if (successCallback) {
            successCallback();
          } else {
            router.push(plusSuccessUrl);
          }
          break;
        default:
          break;
      }
    },
    [router, successCallback],
  );
};

export type PaddleSubProviderProps = PaymentContextProviderProps<
  PaddleEventData,
  CheckoutEventNames
>;

export const PaddleSubProvider = ({
  type,
  children,
  disabledEvents,
  eventsHandler,
  successCallback,
}: PaddleSubProviderProps): ReactElement => {
  const defaultEventsHandler = useDefaultCallback(successCallback);
  const { user, geo, isValidRegion: isPlusAvailable } = useAuthContext();
  const { paddle } = usePaddle({
    paddleCallback: eventsHandler ?? defaultEventsHandler,
    disabledEvents,
  });

  const openCheckout = useCallback(
    ({ priceId, giftToUserId }: OpenCheckoutProps) => {
      if (!isPlusAvailable) {
        return;
      }

      paddle?.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: {
          email: user?.email,
          ...(geo?.region && {
            address: {
              countryCode: geo?.region,
            },
          }),
        },
        customData: {
          user_id: giftToUserId ?? user?.id,
          ...(!!giftToUserId && { gifter_id: user?.id }),
        },
        settings: {
          displayMode: 'inline',
          variant: 'one-page',
          frameTarget: 'checkout-container',
          frameInitialHeight: 500,
          frameStyle:
            'width: 100%; background-color: transparent; border: none;',
          theme: 'dark',
        },
      });
    },
    [paddle, isPlusAvailable, user, geo?.region],
  );

  return (
    <BasePaymentProvider
      type={type}
      openCheckout={openCheckout}
      additionalContext={{ paddle }}
    >
      {children}
    </BasePaymentProvider>
  );
};
