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
import { useGrowthBookContext } from '../../components/GrowthBookProvider';
import { isNullOrUndefined, promisifyEventListener } from '../../lib/func';
import { PlusPriceType } from '../../lib/featureValues';
import { plusSuccessUrl } from '../../lib/constants';
import { usePlusSubscription, useToastNotification } from '../../hooks';
import { LogEvent } from '../../lib/log';
import { DEFAULT_ERROR } from '../../graphql/common';
import { SubscriptionProvider } from '../../lib/plus';
import type {
  PlusPricingPreview,
  PlusPricingMetadata,
} from '../../graphql/paddle';
import { fetchPlusPricingMetadata } from '../../graphql/paddle';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';

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

const getApplePlusPricing = (metadata: PlusPricingMetadata[]) => {
  const response = promisifyEventListener<
    PlusPricingPreview[],
    IAPProduct[] | string
  >('iap-products-result', (event) => {
    const productsRaw = !isNullOrUndefined(event?.detail) ? event.detail : [];

    // Remove JSON parsing once usage of App v1.8 is low
    const products: IAPProduct[] =
      typeof productsRaw === 'string' ? JSON.parse(productsRaw) : productsRaw;

    return metadata
      .map((item) => {
        const product = products.find(
          (p) => p.attributes.offerName === item.idMap.ios,
        );

        if (!product) {
          return null;
        }

        const duration =
          product.attributes.offers[0].recurringSubscriptionPeriod;

        return {
          metadata: item,
          productId: item.idMap.ios,
          price: {
            amount: parseFloat(product.attributes.offers[0].price),
            formatted: product.attributes.offers[0].priceFormatted,
          },
          duration: duration === PlusPriceType.Yearly ? 'year' : 'month',
          trialPeriod: null,
          currency: null,
        } as PlusPricingPreview;
      })
      .filter((item) => !!item);
  });

  return response;
};

export const StoreKitSubProvider = ({
  children,
}: PaymentContextProviderProps): ReactElement => {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const { user, isValidRegion: isPlusAvailable } = useAuthContext();
  const { logSubscriptionEvent } = usePlusSubscription();
  const { growthbook } = useGrowthBookContext();
  const logRef = useRef<typeof logSubscriptionEvent>();
  logRef.current = logSubscriptionEvent;

  const { data } = useQuery<PlusPricingMetadata[]>({
    queryKey: generateQueryKey(RequestKey.PricePreview, user, 'ios', 'plus'),
    queryFn: fetchPlusPricingMetadata,
    enabled: !!user && !!growthbook?.ready && iOSSupportsPlusPurchase(),
    staleTime: StaleTime.Default,
  });
  const { data: productOptions } = useQuery({
    queryKey: ['iap-products'],
    enabled: !!data?.length && !!growthbook?.ready && iOSSupportsPlusPurchase(),
    queryFn: async () => {
      if (!messageHandlerExists(WebKitMessageHandlers.IAPSubscriptionRequest)) {
        return [];
      }

      const response = getApplePlusPricing(data);
      const ids = data.map(({ idMap }) => idMap.ios);

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
        switch (name) {
          case PurchaseEventName.PurchaseCompleted:
            logRef.current({
              event_name: LogEvent.CompleteCheckout,
              extra: {
                user_id: user?.id,
                cycle: product.attributes.offers[0].recurringSubscriptionPeriod,
                localCost: product.attributes.offers[0].price,
                localCurrency: product.attributes.offers[0].currencyCode,
                payment: SubscriptionProvider.AppleStoreKit,
              },
            });
            router.push(plusSuccessUrl);
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
  }, [displayToast, data, router, user?.id]);

  const contextData = useMemo<PaymentContextData>(
    () => ({
      openCheckout,
      productOptions,
      isPlusAvailable,
      giftOneYear: undefined,
      isPricesPending: false,
      isFreeTrialExperiment: false,
    }),
    [isPlusAvailable, openCheckout, productOptions],
  );

  return (
    <PaymentContext.Provider value={contextData}>
      {children}
    </PaymentContext.Provider>
  );
};
