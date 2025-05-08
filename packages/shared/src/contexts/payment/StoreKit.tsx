import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type { ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import type {
  PaymentContextProviderProps,
  OpenCheckoutProps,
  PaymentContextData,
} from './context';
import { PaymentContext } from './context';
import {
  iOSSupportsPlusPurchase,
  messageHandlerExists,
  postWebKitMessage,
  WebKitMessageHandlers,
} from '../../lib/ios';
import { useAuthContext } from '../AuthContext';
import { isNullOrUndefined, promisifyEventListener } from '../../lib/func';
import { PlusPriceType } from '../../lib/featureValues';
import { plusSuccessUrl } from '../../lib/constants';
import { usePlusSubscription, useToastNotification } from '../../hooks';
import { LogEvent } from '../../lib/log';
import { DEFAULT_ERROR } from '../../graphql/common';
import { SubscriptionProvider } from '../../lib/plus';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type {
  ProductPricingMetadata,
  ProductPricingPreview,
} from '../../graphql/paddle';
import { fetchPricingMetadata, ProductPricingType } from '../../graphql/paddle';

export enum StoreKitDuration {
  Monthly = 'P1M',
  Yearly = 'P1Y',
}

export const storekitDurationToPlusDurationMap = {
  [StoreKitDuration.Monthly]: PlusPriceType.Monthly,
  [StoreKitDuration.Yearly]: PlusPriceType.Yearly,
};

export type IAPProduct = {
  attributes: {
    description: {
      standard: string;
    };
    icuLocale: string;
    isFamilyShareable: number;
    kind: string;
    name: string;
    offerName: string;
    offers: {
      currencyCode: string;
      discounts: unknown[]; // Specify a more detailed type if known
      price: string;
      priceFormatted: string;
      recurringSubscriptionPeriod: string;
    }[];
    subscriptionFamilyId: string;
    subscriptionFamilyName: string;
    subscriptionFamilyRank: number;
  };
  href: string;
  id: string;
  type: string;
};

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
};

const getApplePlusPricing = (metadata: ProductPricingMetadata[]) =>
  promisifyEventListener<ProductPricingPreview[], IAPProduct[] | string>(
    'iap-products-result',
    (event) => {
      const products = !isNullOrUndefined(event?.detail)
        ? (event.detail as IAPProduct[])
        : [];

      return metadata
        .map((item) => {
          const product = products.find(
            (p) => p.attributes.offerName === item.idMap.ios,
          );

          if (!product) {
            return null;
          }

          const duration =
            storekitDurationToPlusDurationMap[
              product.attributes.offers[0].recurringSubscriptionPeriod
            ];

          return {
            metadata: item,
            priceId: item.idMap.ios,
            price: {
              amount: parseFloat(product.attributes.offers[0].price),
              formatted: product.attributes.offers[0].priceFormatted,
            },
            duration,
            trialPeriod: null,
            currency: null,
          } as ProductPricingPreview;
        })
        .filter(Boolean);
    },
  );

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
    queryFn: async () => {
      if (!messageHandlerExists(WebKitMessageHandlers.IAPSubscriptionRequest)) {
        return [];
      }

      const response = getApplePlusPricing(metadata);
      const ids = metadata.map(({ idMap }) => idMap.ios).filter(Boolean);

      postWebKitMessage(WebKitMessageHandlers.IAPProductList, ids);

      return response;
    },
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
