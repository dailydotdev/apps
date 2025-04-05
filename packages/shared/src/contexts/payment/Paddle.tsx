import type { PropsWithChildren, ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Environments, Paddle, PaddleEventData } from '@paddle/paddle-js';
import {
  CheckoutEventNames,
  getPaddleInstance,
  initializePaddle,
} from '@paddle/paddle-js';
import { useRouter } from 'next/router';
import { LogEvent } from '../../lib/log';
import { usePixelsContext } from '../PixelsContext';
import type { OpenCheckoutProps } from './context';
import { BasePaymentProvider } from './BasePaymentProvider';
import { plusSuccessUrl } from '../../lib/constants';
import { useAuthContext } from '../AuthContext';
import { usePlusSubscription } from '../../hooks';
import { usePaymentContext } from './context';

export const PaddleSubProvider = ({
  children,
}: PropsWithChildren): ReactElement => {
  const router = useRouter();
  const { user, geo, isValidRegion: isPlusAvailable } = useAuthContext();
  const { trackPayment } = usePixelsContext();
  const [paddle, setPaddle] = useState<Paddle>();
  const { logSubscriptionEvent, isPlus } = usePlusSubscription();
  const logRef = useRef<typeof logSubscriptionEvent>();
  const { giftOneYear } = usePaymentContext();

  // Download and initialize Paddle instance from CDN
  useEffect(() => {
    const existingPaddleInstance = getPaddleInstance();

    if (existingPaddleInstance) {
      setPaddle(existingPaddleInstance);
      return;
    }

    initializePaddle({
      environment:
        (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as Environments) ||
        'production',
      token: process.env.NEXT_PUBLIC_PADDLE_TOKEN,
      eventCallback: (event: PaddleEventData) => {
        switch (event?.name) {
          case CheckoutEventNames.CHECKOUT_PAYMENT_INITIATED:
            logRef.current?.({
              event_name: LogEvent.InitiatePayment,
              target_id: event?.data?.payment.method_details.type,
            });
            break;
          case CheckoutEventNames.CHECKOUT_LOADED:
            logRef.current?.({
              event_name: LogEvent.InitiateCheckout,
              target_id: event?.data?.payment.method_details.type,
            });
            break;
          case CheckoutEventNames.CHECKOUT_PAYMENT_SELECTED:
            logRef.current?.({
              event_name: LogEvent.SelectCheckoutPayment,
              target_id: event?.data?.payment.method_details.type,
            });
            break;
          case CheckoutEventNames.CHECKOUT_COMPLETED:
            logRef.current?.({
              event_name:
                'gifter_id' in event.data.custom_data
                  ? LogEvent.CompleteGiftCheckout
                  : LogEvent.CompleteCheckout,
              extra: {
                user_id:
                  'gifter_id' in event.data.custom_data &&
                  'user_id' in event.data.custom_data
                    ? event.data.custom_data.user_id
                    : undefined,
                cycle:
                  event?.data.items?.[0]?.billing_cycle?.interval ?? 'one-off',
                localCost: event?.data.totals.total,
                localCurrency: event?.data.currency_code,
                payment: event?.data.payment.method_details.type,
              },
            });
            trackPayment(
              event?.data.totals.total,
              event?.data.currency_code,
              event?.data?.transaction_id,
            );
            router.push(plusSuccessUrl);
            break;
          // This doesn't exist in the original code
          case 'checkout.warning' as CheckoutEventNames:
            logRef.current?.({
              event_name: LogEvent.WarningCheckout,
            });
            break;
          case CheckoutEventNames.CHECKOUT_ERROR:
            logRef.current?.({
              event_name: LogEvent.ErrorCheckout,
            });
            break;
          default:
            break;
        }
      },
    }).then((paddleInstance: Paddle | undefined) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    });
  }, [router, trackPayment]);

  const openCheckout = useCallback(
    ({ priceId, giftToUserId }: OpenCheckoutProps) => {
      if (isPlus && priceId !== giftOneYear?.productId) {
        return;
      }

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
    [
      paddle,
      isPlus,
      giftOneYear?.productId,
      isPlusAvailable,
      user,
      geo?.region,
    ],
  );

  return (
    <BasePaymentProvider
      openCheckout={openCheckout}
      additionalContext={{ paddle }}
    >
      {children}
    </BasePaymentProvider>
  );
};
