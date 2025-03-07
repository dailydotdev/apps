import React, { useCallback, useMemo } from 'react';
import type { ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  PaymentContextProviderProps,
  OpenCheckoutProps,
  PaymentContextData,
  ProductOption,
} from './context';
import { PaymentContext } from './context';
import { sendMessage, WebKitMessageHandlers } from '../../lib/ios';
import { useAuthContext } from '../AuthContext';
import { useFeature } from '../../components/GrowthBookProvider';
import { featureIAPProducts } from '../../lib/featureManagement';
import { isNullOrUndefined, promisifyEventListener } from '../../lib/func';
import { PlusPriceType, PlusPriceTypeAppsId } from '../../lib/featureValues';

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

export const StoreKitSubProvider = ({
  children,
}: PaymentContextProviderProps): ReactElement => {
  const { user } = useAuthContext();
  const productIds = useFeature(featureIAPProducts);
  const productList = useMemo(() => Object.keys(productIds), [productIds]);

  const { data: productOptions } = useQuery({
    queryKey: ['iap-products'],
    enabled: !!productIds,
    queryFn: async () => {
      const products = promisifyEventListener(
        'iap-products-result',
        (event) => {
          const productsRaw = !isNullOrUndefined(event?.detail)
            ? JSON.parse(event.detail)
            : [];

          return productsRaw
            ?.map((product: IAPProduct): ProductOption => {
              const duration = productIds[
                product.attributes.offerName
              ] as PlusPriceType;

              return {
                label: product.attributes.name,
                value: product.attributes.offerName,
                price: {
                  amount: parseFloat(product.attributes.offers[0].price),
                  formatted: product.attributes.offers[0].priceFormatted,
                  monthlyAmount: parseFloat(product.attributes.offers[0].price),
                  monthlyFormatted: product.attributes.offers[0].priceFormatted,
                },
                extraLabel: product.attributes?.description?.standard,
                appsId:
                  product.attributes.offerName === 'annualSpecial'
                    ? PlusPriceTypeAppsId.EarlyAdopter
                    : PlusPriceTypeAppsId.Default,
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
        },
      );

      sendMessage(WebKitMessageHandlers.IAPProductList, productList);

      return products;
    },
  });

  const openCheckout = useCallback(
    ({ priceId }: OpenCheckoutProps) => {
      sendMessage(WebKitMessageHandlers.IAPSubscriptionRequest, {
        productId: priceId,
        appAccountToken: user?.subscriptionFlags?.appAccountToken,
      });
    },
    [user?.subscriptionFlags?.appAccountToken],
  );

  const contextData = useMemo<PaymentContextData>(
    () => ({
      openCheckout,
      productOptions,
      earlyAdopterPlanId: null,
      isPlusAvailable: false,
      giftOneYear: undefined,
      isPricesPending: false,
      isFreeTrialExperiment: false,
    }),
    [openCheckout, productOptions],
  );

  return (
    <PaymentContext.Provider value={contextData}>
      {children}
    </PaymentContext.Provider>
  );
};
