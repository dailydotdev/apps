import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type { ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import type {
  PaymentContextProviderProps,
  PaymentContextData,
  OpenCheckoutProps,
} from './context';
import { PaymentContext } from './context';
import {
  iOSSupportsPlusPurchase,
  postWebKitMessage,
  WebKitMessageHandlers,
} from '../../lib/ios';
import { useAuthContext } from '../AuthContext';
import { promisifyEventListener } from '../../lib/func';
import { plusSuccessUrl } from '../../lib/constants';
import { usePlusSubscription, useToastNotification } from '../../hooks';
import { LogEvent } from '../../lib/log';
import { DEFAULT_ERROR } from '../../graphql/common';
import { SubscriptionProvider } from '../../lib/plus';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { ProductPricingMetadata } from '../../graphql/paddle';
import { fetchPricingMetadata, ProductPricingType } from '../../graphql/paddle';
import type { IAPProduct } from './common';
import { getApplePricing } from './common';

export enum PurchaseEventName {
  PurchaseCompleted = 'PurchaseCompleted',
  PurchaseInitiated = 'PurchaseInitiated',
  PurchasePending = 'PurchasePending',
  PurchaseFailed = 'PurchaseFailed',
  PurchaseError = 'PurchaseError',
  PurchaseCancelled = 'PurchaseCancelled',
}

export type PurchaseEvent = {
  name: PurchaseEventName;
  product?: IAPProduct;
  detail?: string;
  transactionId?: string;
};

export type StoreKitSubProviderProps = PaymentContextProviderProps<
  CustomEvent<PurchaseEvent>,
  PurchaseEventName
>;

export const StoreKitSubProvider = ({
  children,
  successCallback,
}: PaymentContextProviderProps): ReactElement => {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const { user, isValidRegion: isPlusAvailable } = useAuthContext();
  const { logSubscriptionEvent } = usePlusSubscription();
  const logRef = useRef<typeof logSubscriptionEvent>();
  logRef.current = logSubscriptionEvent;

  const { data: metadata } = useQuery<ProductPricingMetadata[]>({
    queryKey: generateQueryKey(RequestKey.PricePreview, user, 'ios', 'plus'),
    queryFn: () => fetchPricingMetadata(ProductPricingType.Plus),
    enabled: !!user && iOSSupportsPlusPurchase(),
    staleTime: StaleTime.Default,
  });

  const { data: products } = useQuery({
    queryKey: ['iap-products'],
    enabled: !!metadata?.length && iOSSupportsPlusPurchase(),
    staleTime: StaleTime.Default,
    queryFn: async () => getApplePricing(metadata),
  });

  const openCheckout = useCallback(
    ({ priceId }: OpenCheckoutProps) => {
      postWebKitMessage(WebKitMessageHandlers.IAPSubscriptionRequest, {
        productId: priceId,
        appAccountToken: user?.subscriptionFlags?.appAccountToken,
      });
    },
    [user?.subscriptionFlags?.appAccountToken],
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
            logRef.current({
              event_name: LogEvent.CompleteCheckout,
              extra: {
                user_id: user?.id,
                cycle: item.duration,
                localCost: product.attributes.offers[0].price,
                localCurrency: product.attributes.offers[0].currencyCode,
                payment: SubscriptionProvider.AppleStoreKit,
              },
            });
            if (successCallback) {
              successCallback(null);
            } else {
              router.push(plusSuccessUrl);
            }
            break;
          case PurchaseEventName.PurchaseInitiated:
            logRef.current({
              event_name: LogEvent.InitiatePayment,
            });
            break;
          case PurchaseEventName.PurchaseFailed:
            logRef.current({
              event_name: LogEvent.ErrorCheckout,
              extra: {
                errorCode: detail,
              },
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
  }, [displayToast, products, metadata, router, successCallback, user?.id]);

  const contextData = useMemo<PaymentContextData>(
    () => ({
      openCheckout,
      productOptions: products,
      isPlusAvailable,
      giftOneYear: undefined,
      isPricesPending: false,
      isFreeTrialExperiment: false,
    }),
    [isPlusAvailable, openCheckout, products],
  );

  return (
    <PaymentContext.Provider value={contextData}>
      {children}
    </PaymentContext.Provider>
  );
};
