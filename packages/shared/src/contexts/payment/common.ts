import type {
  ProductPricingMetadata,
  ProductPricingPreview,
} from '../../graphql/paddle';
import { PlusPriceType } from '../../lib/featureValues';
import { promisifyEventListener, isNullOrUndefined } from '../../lib/func';
import {
  messageHandlerExists,
  WebKitMessageHandlers,
  postWebKitMessage,
} from '../../lib/ios';

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

export const getAppleProducts = (metadata: ProductPricingMetadata[]) =>
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

export const getApplePricing = async (
  metadata: ProductPricingMetadata[],
  customIds?: string[],
) => {
  if (!messageHandlerExists(WebKitMessageHandlers.IAPSubscriptionRequest)) {
    return [];
  }

  const response = getAppleProducts(metadata);
  const ids =
    customIds || metadata.map(({ idMap }) => idMap.ios).filter(Boolean);

  postWebKitMessage(WebKitMessageHandlers.IAPProductList, ids);

  return response;
};
