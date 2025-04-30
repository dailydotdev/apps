import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Environments, Paddle, PaddleEventData } from '@paddle/paddle-js';
import { CheckoutEventNames, initializePaddle } from '@paddle/paddle-js';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { checkIsExtension, promisifyEventListener } from '../../lib/func';
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
  const [paddle, setPaddle] = useState<Paddle>();
  const isCheckoutOpenRef = React.useRef(false);
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
    if (checkIsExtension()) {
      // Payment not available on extension
      return;
    }

    isCheckoutOpenRef.current = false;

    // TODO feat/transactions disabled for now since it looks like existing paddle instance does not load
    // const existingPaddleInstance = getPaddleInstance();
    // if (existingPaddleInstance) {
    //   setPaddle(existingPaddleInstance);
    //   return;
    // }

    initializePaddle({
      environment:
        (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as Environments) ||
        'production',
      token: process.env.NEXT_PUBLIC_PADDLE_TOKEN,
      eventCallback: (event: PaddleEventData) => {
        switch (event?.name) {
          case CheckoutEventNames.CHECKOUT_PAYMENT_INITIATED:
            logRef.current({
              event_name: LogEvent.InitiatePayment,
              target_type: TargetType.Credits,
              target_id: event?.data?.payment.method_details.type,
            });
            break;
          case CheckoutEventNames.CHECKOUT_LOADED:
            isCheckoutOpenRef.current = true;

            logRef.current({
              event_name: LogEvent.InitiateCheckout,
              target_type: TargetType.Credits,
              target_id: event?.data?.payment.method_details.type,
            });
            break;
          case CheckoutEventNames.CHECKOUT_PAYMENT_SELECTED:
            logRef.current({
              event_name: LogEvent.SelectCheckoutPayment,
              target_type: TargetType.Credits,
              target_id: event?.data?.payment.method_details.type,
            });
            break;
          // This doesn't exist in the original code
          case 'checkout.warning' as CheckoutEventNames:
            logRef.current({
              event_name: LogEvent.WarningCheckout,
              target_type: TargetType.Credits,
            });
            break;
            break;
          case CheckoutEventNames.CHECKOUT_ERROR:
            logRef.current({
              event_name: LogEvent.ErrorCheckout,
              target_type: TargetType.Credits,
            });
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
  }, []);

  useEffect(() => {
    const eventName = 'iap-purchase-event';
    promisifyEventListener<void, PurchaseEvent>(
      eventName,
      (event) => {
        const { name, product, transactionId } = event.detail;
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
          // case PurchaseEventName.PurchaseInitiated:
          //   logRef.current({
          //     event_name: LogEvent.InitiatePayment,
          //   });
          //   break;
          // case PurchaseEventName.PurchaseFailed:
          //   logRef.current({
          //     event_name: LogEvent.ErrorCheckout,
          //     extra: {
          //       errorCode: detail,
          //     },
          //   });
          //   displayToast(DEFAULT_ERROR);
          //   break;
          // case PurchaseEventName.PurchasePending:
          //   displayToast('Please wait for the purchase to be completed.');
          //   break;
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
  }, [user?.id]);

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
      paddle,
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
      paddle,
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
