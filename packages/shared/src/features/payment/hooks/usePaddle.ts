import { useState, useEffect, useRef } from 'react';
import type { Environments, Paddle, PaddleEventData } from '@paddle/paddle-js';
import {
  CheckoutEventNames,
  getPaddleInstance,
  initializePaddle,
} from '@paddle/paddle-js';
import { usePixelsContext } from '../../../contexts/PixelsContext';
import { LogEvent } from '../../../lib/log';
import { checkIsExtension } from '../../../lib/func';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';

export type PaddleEventCallback = (event: PaddleEventData) => void;

function getPaddleEventCallback(
  logSubscriptionEvent: ReturnType<
    typeof usePlusSubscription
  >['logSubscriptionEvent'],
  trackPayment: ReturnType<typeof usePixelsContext>['trackPayment'],
  paddleCallback: PaddleEventCallback,
  disabledEvents?: CheckoutEventNames[],
): PaddleEventCallback {
  return (event: PaddleEventData) => {
    paddleCallback(event);
    if (disabledEvents?.includes(event?.name as CheckoutEventNames)) {
      return;
    }

    switch (event?.name) {
      case CheckoutEventNames.CHECKOUT_PAYMENT_INITIATED:
        logSubscriptionEvent({
          event_name: LogEvent.InitiatePayment,
          target_id: event?.data?.payment.method_details.type,
        });
        break;
      case CheckoutEventNames.CHECKOUT_LOADED:
        logSubscriptionEvent({
          event_name: LogEvent.InitiateCheckout,
          target_id: event?.data?.payment.method_details.type,
        });
        break;
      case CheckoutEventNames.CHECKOUT_PAYMENT_SELECTED:
        logSubscriptionEvent({
          event_name: LogEvent.SelectCheckoutPayment,
          target_id: event?.data?.payment.method_details.type,
        });
        break;
      case CheckoutEventNames.CHECKOUT_COMPLETED:
        logSubscriptionEvent({
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
            cycle: event?.data.items?.[0]?.billing_cycle?.interval ?? 'one-off',
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
        break;
      // This doesn't exist in the original code
      case 'checkout.warning' as CheckoutEventNames:
        logSubscriptionEvent({
          event_name: LogEvent.WarningCheckout,
        });
        break;
      case CheckoutEventNames.CHECKOUT_ERROR:
        logSubscriptionEvent({
          event_name: LogEvent.ErrorCheckout,
        });
        break;
      default:
        break;
    }
  };
}

export type UsePaddleProps = {
  paddleCallback: PaddleEventCallback;
  disabledEvents?: CheckoutEventNames[];
};

export type UsePaddleReturn = {
  paddle: Paddle | undefined;
};

export const usePaddle = ({
  paddleCallback,
  disabledEvents,
}: UsePaddleProps): UsePaddleReturn => {
  const { trackPayment } = usePixelsContext();
  const [paddle, setPaddle] = useState<Paddle>();
  const { logSubscriptionEvent } = usePlusSubscription();
  const eventCallbackRef = useRef<PaddleEventCallback>();

  useEffect(() => {
    eventCallbackRef.current = getPaddleEventCallback(
      logSubscriptionEvent,
      trackPayment,
      paddleCallback,
      disabledEvents,
    );
  }, [logSubscriptionEvent, trackPayment, paddleCallback, disabledEvents]);

  // Download and initialize Paddle instance from CDN
  useEffect(() => {
    if (checkIsExtension()) {
      // Payment not available on extension
      return;
    }
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
        eventCallbackRef.current?.(event);
      },
    }).then((paddleInstance: Paddle | undefined) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    });
  }, [trackPayment]);

  return {
    paddle,
  };
};
