import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { promisifyEventListener } from '../../lib/func';
import { useAuthContext } from '../AuthContext';
import { LogEvent, TargetType } from '../../lib/log';
import {
  getQuantityForPrice,
  transactionPricesQueryOptions,
} from '../../graphql/njord';
import { useLogContext } from '../LogContext';
import { postWebKitMessage, WebKitMessageHandlers } from '../../lib/ios';
import type { OpenCheckoutProps } from '../payment/context';
import type {
  BuyCoresContextData,
  BuyCoresContextProviderProps,
  CoreProductOption,
  ProcessingError,
  Screens,
} from './types';
import { BuyCoresContext, SCREENS } from './types';
import type { PurchaseEvent } from '../payment/StoreKit';
import { PurchaseEventName } from '../payment/StoreKit';
import { SubscriptionProvider } from '../../lib/plus';
import { DEFAULT_ERROR } from '../../graphql/common';
import { useToastNotification } from '../../hooks';

export const StoreKitBuyCoresContextProvider = ({
  onCompletion,
  origin,
  amountNeeded,
  children,
}: BuyCoresContextProviderProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { user, isLoggedIn } = useAuthContext();
  const [activeStep, setActiveStep] = useState<{
    step: Screens;
    providerTransactionId?: string;
    error?: ProcessingError;
  }>({
    step: SCREENS.INTRO,
  });
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    value: number;
  }>();
  const { displayToast } = useToastNotification();
  const logRef = useRef<typeof logEvent>();
  logRef.current = logEvent;

  const { data: prices } = useQuery(
    transactionPricesQueryOptions({
      user,
      isLoggedIn,
    }),
  );

  const getQuantityForPriceFn = ({ priceId }: { priceId: string }) => {
    return getQuantityForPrice({ priceId, prices });
  };
  const getQuantityForPriceRef = useRef(getQuantityForPriceFn);
  getQuantityForPriceRef.current = getQuantityForPriceFn;

  useEffect(() => {
    const eventName = 'iap-purchase-event';
    promisifyEventListener<void, PurchaseEvent>(
      eventName,
      (event) => {
        const { name, product, transactionId, detail } = event.detail;
        switch (name) {
          case PurchaseEventName.PurchaseCompleted:
            logRef.current({
              event_name: LogEvent.CompleteCheckout,
              target_type: TargetType.Credits,
              extra: JSON.stringify({
                user_id: user?.id,
                quantity: getQuantityForPriceRef.current({
                  priceId: product.attributes.offerName,
                }),
                localCost: product.attributes.offers[0].price,
                localCurrency: product.attributes.offers[0].currencyCode,
                payment: SubscriptionProvider.AppleStoreKit,
              }),
            });

            setActiveStep({
              step: SCREENS.PROCESSING,
              providerTransactionId: transactionId,
            });

            break;
          case PurchaseEventName.PurchaseInitiated:
            logRef.current({
              event_name: LogEvent.InitiatePayment,
              target_type: TargetType.Credits,
            });
            break;
          case PurchaseEventName.PurchaseFailed:
            logRef.current({
              event_name: LogEvent.ErrorCheckout,
              target_type: TargetType.Credits,
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
            setSelectedProduct(undefined);
            break;
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
  }, [user?.id, displayToast]);

  const openCheckout = useCallback(
    ({ priceId }: OpenCheckoutProps) => {
      postWebKitMessage(WebKitMessageHandlers.IAPCoresPurchase, {
        productId: priceId,
        appAccountToken: user?.subscriptionFlags?.appAccountToken,
      });
    },
    [user?.subscriptionFlags?.appAccountToken],
  );

  const contextData = useMemo<BuyCoresContextData>(
    () => ({
      amountNeeded,
      onCompletion,
      activeStep: activeStep.step,
      error: activeStep.error,
      setActiveStep,
      selectedProduct,
      setSelectedProduct,
      openCheckout,
      providerTransactionId: activeStep.providerTransactionId,
      origin,
    }),
    [
      activeStep,
      amountNeeded,
      onCompletion,
      openCheckout,
      origin,
      selectedProduct,
    ],
  );

  return (
    <BuyCoresContext.Provider value={contextData}>
      {children}
    </BuyCoresContext.Provider>
  );
};

export const useCoreProductOptionQuery = (): CoreProductOption => {
  const { user, isLoggedIn } = useAuthContext();
  const router = useRouter();
  const pid = router?.query?.pid;

  const { data: prices } = useQuery(
    transactionPricesQueryOptions({
      user,
      isLoggedIn,
    }),
  );

  return useMemo(() => {
    const price = prices?.find((item) => item.value === pid);

    if (!price) {
      return undefined;
    }

    return {
      id: price.value,
      value: price.coresValue,
    };
  }, [prices, pid]);
};
