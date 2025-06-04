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
import { useAtomValue } from 'jotai';
import { useAuthContext } from '../contexts/AuthContext';
import { useLogContext } from '../contexts/LogContext';
import type { TargetType } from '../lib/log';
import { LogEvent } from '../lib/log';
import { plusSuccessUrl } from '../lib/constants';
import { checkIsExtension } from '../lib/func';
import type {
  OpenCheckoutProps,
  PaymentContextProviderProps,
} from '../contexts/payment/context';
import { priceTypeAtom } from '../contexts/payment/context';
import { PlusPlanType, PurchaseType } from '../graphql/paddle';

interface UsePaddlePaymentProps
  extends Pick<
    PaymentContextProviderProps<PaddleEventData, CheckoutEventNames>,
    'successCallback' | 'disabledEvents'
  > {
  targetType: TargetType;
  getProductQuantity?: (event: PaddleEventData) => number;
}

export const usePaddlePayment = ({
  successCallback,
  disabledEvents,
  targetType,
  getProductQuantity,
}: UsePaddlePaymentProps) => {
  const router = useRouter();
  const { logEvent } = useLogContext();
  const { user, geo, trackingId } = useAuthContext();
  const [paddle, setPaddle] = useState<Paddle>();
  const isCheckoutOpenRef = useRef(false);
  const [checkoutItemsLoading, setCheckoutItemsLoading] = useState(false);
  const logRef = useRef<typeof logEvent>();
  logRef.current = logEvent;
  const successCallbackRef = useRef(successCallback);
  successCallbackRef.current = successCallback;
  const getProductQuantityRef = useRef(getProductQuantity);
  getProductQuantityRef.current = getProductQuantity;
  const discountIdQuery = router.query?.d_id as string | undefined;

  const priceType = useAtomValue(priceTypeAtom);

  const isOrganization = priceType === PurchaseType.Organization;
  const isPlusPlan = priceType === PurchaseType.Plus || isOrganization;

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

        const customData =
          event?.data?.custom_data || ({} as Record<string, unknown>);

        const plusPlanExtra = isPlusPlan
          ? {
              plan_type: isOrganization
                ? PlusPlanType.Organization
                : PlusPlanType.Personal,
              team_size: event?.data?.items?.[0]?.quantity,
            }
          : undefined;

        switch (event?.name) {
          case CheckoutEventNames.CHECKOUT_PAYMENT_INITIATED:
            logRef.current({
              target_type: targetType,
              event_name: LogEvent.InitiatePayment,
              target_id: event?.data?.payment.method_details.type,
              extra: JSON.stringify({
                ...plusPlanExtra,
              }),
            });
            break;
          case CheckoutEventNames.CHECKOUT_LOADED:
            isCheckoutOpenRef.current = true;
            logRef.current({
              target_type: targetType,
              event_name: LogEvent.InitiateCheckout,
              target_id: event?.data?.payment.method_details.type,
              extra: JSON.stringify({
                ...plusPlanExtra,
              }),
            });
            break;
          case CheckoutEventNames.CHECKOUT_PAYMENT_SELECTED:
            logRef.current({
              target_type: targetType,
              event_name: LogEvent.SelectCheckoutPayment,
              target_id: event?.data?.payment.method_details.type,
              extra: JSON.stringify({
                ...plusPlanExtra,
              }),
            });
            break;
          case CheckoutEventNames.CHECKOUT_COMPLETED:
            isCheckoutOpenRef.current = false;
            logRef.current({
              target_type: targetType,
              event_name: LogEvent.CompleteCheckout,
              extra: JSON.stringify({
                user_id:
                  'gifter_id' in customData && 'user_id' in customData
                    ? customData.user_id
                    : undefined,
                quantity: getProductQuantityRef.current?.(event),
                localCost: event?.data.totals.total,
                localCurrency: event?.data.currency_code,
                payment: event?.data.payment.method_details.type,
                cycle:
                  event?.data.items?.[0]?.billing_cycle?.interval ?? 'one-off',
                ...plusPlanExtra,
              }),
            });

            if (successCallbackRef.current) {
              successCallbackRef.current(event);
            } else {
              router.push(plusSuccessUrl);
            }
            break;
          // This doesn't exist in the original code
          case 'checkout.warning' as CheckoutEventNames:
            logRef.current({
              target_type: targetType,
              event_name: LogEvent.WarningCheckout,
            });
            break;
          case CheckoutEventNames.CHECKOUT_ERROR:
            logRef.current({
              target_type: targetType,
              event_name: LogEvent.ErrorCheckout,
            });
            break;
          case CheckoutEventNames.CHECKOUT_PAYMENT_FAILED:
            logRef.current({
              target_type: targetType,
              event_name: LogEvent.ErrorPayment,
            });
            break;
          case CheckoutEventNames.CHECKOUT_CLOSED:
            isCheckoutOpenRef.current = false;
            break;
          case CheckoutEventNames.CHECKOUT_ITEMS_UPDATED:
            setCheckoutItemsLoading(false);
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
  }, [router, disabledEvents, targetType, isOrganization, isPlusPlan]);

  const openCheckout = useCallback(
    ({
      priceId,
      giftToUserId,
      discountId,
      quantity = 1,
    }: OpenCheckoutProps) => {
      const items: CheckoutLineItem[] = [{ priceId, quantity }];
      const customer: CheckoutCustomer = {
        ...(user?.email
          ? {
              email: user?.email,
            }
          : {
              id: 'anonymous',
            }),
        ...(geo?.region && {
          address: { countryCode: geo?.region },
        }),
      };

      const customData = {
        user_id: giftToUserId ?? user?.id,
        tracking_id: trackingId,
        ...(!!giftToUserId && { gifter_id: user?.id }),
      };

      if (isCheckoutOpenRef.current) {
        setCheckoutItemsLoading(true);
        paddle?.Checkout.updateItems(items);
        return;
      }

      paddle?.Checkout.open({
        items,
        customer,
        customData,
        discountId: discountId || discountIdQuery,
      });
    },
    [
      paddle?.Checkout,
      user?.email,
      user?.id,
      geo?.region,
      trackingId,
      discountIdQuery,
    ],
  );

  return {
    paddle,
    openCheckout,
    isPaddleReady: !!paddle,
    checkoutItemsLoading,
  };
};
