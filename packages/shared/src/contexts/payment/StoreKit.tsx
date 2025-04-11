import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type { ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import type {
  PaymentContextProviderProps,
  OpenCheckoutProps,
  PaymentContextData,
  ProductOption,
} from './context';
import { PaymentContext } from './context';
import {
  iOSSupportsPlusPurchase,
  messageHandlerExists,
  postWebKitMessage,
  WebKitMessageHandlers,
} from '../../lib/ios';
import { useAuthContext } from '../AuthContext';
import {
  useFeature,
  useGrowthBookContext,
} from '../../components/GrowthBookProvider';
import { featureIAPProducts } from '../../lib/featureManagement';
import { isNullOrUndefined, promisifyEventListener } from '../../lib/func';
import { PlusPriceType, PlusPriceTypeAppsId } from '../../lib/featureValues';
import { plusSuccessUrl } from '../../lib/constants';
import { usePlusSubscription, useToastNotification } from '../../hooks';
import { LogEvent } from '../../lib/log';
import { DEFAULT_ERROR } from '../../graphql/common';
import { SubscriptionProvider } from '../../lib/plus';

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

export const StoreKitSubProvider = ({
  children,
  successCallback,
}: PaymentContextProviderProps): ReactElement => {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const { user, isValidRegion: isPlusAvailable } = useAuthContext();
  const { logSubscriptionEvent } = usePlusSubscription();
  const { growthbook } = useGrowthBookContext();
  const productIds = useFeature(featureIAPProducts);
  const productList = useMemo(() => Object.keys(productIds), [productIds]);
  const logRef = useRef<typeof logSubscriptionEvent>();
  logRef.current = logSubscriptionEvent;

  const { data: productOptions } = useQuery({
    queryKey: ['iap-products'],
    enabled: !!productIds && !!growthbook?.ready && iOSSupportsPlusPurchase(),
    queryFn: async () => {
      if (!messageHandlerExists(WebKitMessageHandlers.IAPSubscriptionRequest)) {
        return [];
      }

      const response = promisifyEventListener<
        ProductOption[],
        IAPProduct[] | string
      >('iap-products-result', (event) => {
        const productsRaw = !isNullOrUndefined(event?.detail)
          ? event.detail
          : [];

        // Remove JSON parsing once usage of App v1.8 is low
        const products: IAPProduct[] =
          typeof productsRaw === 'string'
            ? JSON.parse(productsRaw)
            : productsRaw;

        return products
          ?.map((product: IAPProduct): ProductOption => {
            const { duration, label, extraLabel, appsId } =
              productIds[product.attributes.offerName];

            return {
              label,
              value: product.attributes.offerName,
              price: {
                amount: parseFloat(product.attributes.offers[0].price),
                formatted: product.attributes.offers[0].priceFormatted,
              },
              extraLabel,
              appsId: appsId ?? PlusPriceTypeAppsId.Default,
              duration,
              durationLabel:
                duration === PlusPriceType.Yearly ? 'year' : 'month',
              trialPeriod: null,
            };
          })
          .sort((a: { value: string }, b: { value: string }) => {
            // Make sure that the products are sorted in the same order as the product list
            // because the native code does not guarantee the order of the products
            const aIndex = productList.indexOf(a.value);
            const bIndex = productList.indexOf(b.value);
            return aIndex - bIndex;
          });
      });

      postWebKitMessage(WebKitMessageHandlers.IAPProductList, productList);

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
                cycle: productIds[product.attributes.offerName].duration,
                localCost: product.attributes.offers[0].price,
                localCurrency: product.attributes.offers[0].currencyCode,
                payment: SubscriptionProvider.AppleStoreKit,
              },
            });
            if (successCallback) {
              successCallback();
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
  }, [displayToast, productIds, router, successCallback, user?.id]);

  const contextData = useMemo<PaymentContextData>(
    () => ({
      openCheckout,
      productOptions,
      earlyAdopterPlanId: null,
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
