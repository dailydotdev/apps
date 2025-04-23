import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  CheckoutCustomer,
  CheckoutLineItem,
  Environments,
  Paddle,
  PaddleEventData,
} from '@paddle/paddle-js';
import { CheckoutEventNames, initializePaddle } from '@paddle/paddle-js';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent } from '../lib/log';
import { plusSuccessUrl } from '../lib/constants';
import { checkIsExtension } from '../lib/func';
import type { PaymentContextProviderProps } from '../contexts/payment/context';

export interface PaddleCheckoutOptions {
  priceId: string;
  giftToUserId?: string;
  customData?: Record<string, unknown>;
}

export const usePaddlePayment = ({
  successCallback,
  disabledEvents,
}: Pick<PaymentContextProviderProps, 'successCallback' | 'disabledEvents'>) => {
  const router = useRouter();
  const { logEvent } = useLogContext();
  const { user, geo } = useAuthContext();
  const [paddle, setPaddle] = useState<Paddle>();
  const isCheckoutOpenRef = useRef(false);
  const logRef = useRef<typeof logEvent>();
  logRef.current = logEvent;

  useEffect(() => {
    if (checkIsExtension()) {
      // Payment not available on extension
      return;
    }

    isCheckoutOpenRef.current = false;

    initializePaddle({
      environment:
        (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as Environments) ||
        'production',
      token: process.env.NEXT_PUBLIC_PADDLE_TOKEN,
      eventCallback: (event: PaddleEventData) => {
        if (disabledEvents?.includes(event?.name as CheckoutEventNames)) {
          return;
        }

        const customData = event.data.custom_data as Record<string, unknown>;

        switch (event?.name) {
          case CheckoutEventNames.CHECKOUT_PAYMENT_INITIATED:
            logRef.current({
              event_name: LogEvent.InitiatePayment,
              target_id: event?.data?.payment.method_details.type,
            });
            break;
          case CheckoutEventNames.CHECKOUT_LOADED:
            isCheckoutOpenRef.current = true;
            logRef.current({
              event_name: LogEvent.InitiateCheckout,
              target_id: event?.data?.payment.method_details.type,
            });
            break;
          case CheckoutEventNames.CHECKOUT_PAYMENT_SELECTED:
            logRef.current({
              event_name: LogEvent.SelectCheckoutPayment,
              target_id: event?.data?.payment.method_details.type,
            });
            break;
          case CheckoutEventNames.CHECKOUT_COMPLETED:
            logRef.current({
              event_name: LogEvent.CompleteCheckout,
              extra: JSON.stringify({
                user_id:
                  'gifter_id' in customData && 'user_id' in customData
                    ? customData.user_id
                    : undefined,
                localCost: event?.data.totals.total,
                localCurrency: event?.data.currency_code,
                payment: event?.data.payment.method_details.type,
                cycle:
                  event?.data.items?.[0]?.billing_cycle?.interval ?? 'one-off',
              }),
            });

            if (successCallback) {
              successCallback();
            } else {
              router.push(plusSuccessUrl);
            }
            break;
          case CheckoutEventNames.CHECKOUT_ERROR:
            logRef.current({ event_name: LogEvent.ErrorCheckout });
            break;
          case CheckoutEventNames.CHECKOUT_CLOSED:
            isCheckoutOpenRef.current = false;
            break;
          default:
            break;
        }
      },
      checkout: {
        settings: {
          displayMode: 'inline',
          frameTarget: 'checkout-container',
          frameInitialHeight: 500,
          frameStyle:
            'width: 100%; background-color: transparent; border: none;',
          theme: 'dark',
          variant: 'one-page',
        },
      },
    }).then((paddleInstance: Paddle | undefined) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    });
  }, [router, successCallback, disabledEvents]);

  const openCheckout = useCallback(
    ({ priceId, giftToUserId }: PaddleCheckoutOptions) => {
      const items: CheckoutLineItem[] = [{ priceId, quantity: 1 }];
      const customer: CheckoutCustomer = {
        email: user?.email,
        ...(geo?.region && {
          address: { countryCode: geo?.region },
        }),
      };

      const customData = {
        user_id: giftToUserId ?? user?.id,
        ...(!!giftToUserId && { gifter_id: user?.id }),
      };

      if (isCheckoutOpenRef.current) {
        paddle?.Checkout.updateItems(items);
        return;
      }

      paddle?.Checkout.open({
        items,
        customer,
        customData,
      });
    },
    [paddle?.Checkout, user?.email, user?.id, geo?.region],
  );

  return {
    paddle,
    openCheckout,
  };
};
