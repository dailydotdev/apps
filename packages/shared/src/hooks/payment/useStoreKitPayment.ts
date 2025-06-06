import { useCallback, useEffect, useRef } from 'react';
import type { PurchaseEvent } from '../../contexts/payment/StoreKit';
import { DEFAULT_ERROR } from '../../graphql/common';
import { promisifyEventListener } from '../../lib/func';
import { LogEvent, purchaseTypeToTargetType } from '../../lib/log';
import { SubscriptionProvider } from '../../lib/plus';
import { useAuthContext } from '../../contexts/AuthContext';
import type { OpenCheckoutProps } from '../../contexts/payment/context';
import type { ProductPricingPreview, PurchaseType } from '../../graphql/paddle';
import { postWebKitMessage, WebKitMessageHandlers } from '../../lib/ios';
import { useToastNotification } from '../useToastNotification';
import { useLogContext } from '../../contexts/LogContext';
import { PurchaseEventName } from '../../contexts/payment/common';

interface UseStoreKitPaymentProps {
  type: PurchaseType;
  products: ProductPricingPreview[];
  successCallback: (event: CustomEvent<PurchaseEvent>) => void;
}

const typeToHandler: Record<PurchaseType, WebKitMessageHandlers> = {
  cores: WebKitMessageHandlers.IAPCoresPurchase,
  plus: WebKitMessageHandlers.IAPSubscriptionRequest,
  organization: WebKitMessageHandlers.IAPSubscriptionRequest,
};

export const useStoreKitPayment = ({
  type,
  products,
  successCallback,
}: UseStoreKitPaymentProps) => {
  const targetType = purchaseTypeToTargetType[type];
  const messageType = typeToHandler[type];
  const { displayToast } = useToastNotification();
  const { user } = useAuthContext();
  const successCallbackRef = useRef(successCallback);
  successCallbackRef.current = successCallback;
  const { logEvent } = useLogContext();
  const eventLoggerRef = useRef(logEvent);
  eventLoggerRef.current = logEvent;

  const openCheckout = useCallback(
    ({ priceId }: OpenCheckoutProps) => {
      postWebKitMessage(messageType, {
        productId: priceId,
        appAccountToken: user?.subscriptionFlags?.appAccountToken,
      });
    },
    [user?.subscriptionFlags?.appAccountToken, messageType],
  );

  useEffect(() => {
    const eventName = 'iap-purchase-event';
    promisifyEventListener<void, PurchaseEvent>(
      eventName,
      (event) => {
        const { name, detail, product } = event.detail;
        const item = products?.find(
          ({ priceId }) => priceId === product?.attributes?.offerName,
        );
        switch (name) {
          case PurchaseEventName.PurchaseCompleted:
            eventLoggerRef.current({
              event_name: LogEvent.CompleteCheckout,
              target_type: targetType,
              extra: JSON.stringify({
                quantity: item.metadata.coresValue,
                user_id: user?.id,
                cycle: item.duration,
                localCost: product.attributes.offers[0].price,
                localCurrency: product.attributes.offers[0].currencyCode,
                payment: SubscriptionProvider.AppleStoreKit,
              }),
            });
            successCallbackRef.current?.(event);
            break;
          case PurchaseEventName.PurchaseInitiated:
            eventLoggerRef.current({
              event_name: LogEvent.InitiatePayment,
              target_type: targetType,
            });
            break;
          case PurchaseEventName.PurchaseFailed:
            eventLoggerRef.current({
              event_name: LogEvent.ErrorCheckout,
              target_type: targetType,
              extra: JSON.stringify({
                errorCode: detail,
              }),
            });
            displayToast(DEFAULT_ERROR);
            break;
          case PurchaseEventName.PurchasePending:
            displayToast('Please wait for the purchase to be completed.');
            break;
          case PurchaseEventName.PurchaseCancelled:
          default:
            break;
        }
      },
      {
        once: false,
      },
    );

    return () => {
      globalThis?.eventControllers?.[eventName]?.abort();
    };
  }, [displayToast, products, targetType, user?.id]);

  return { openCheckout };
};
