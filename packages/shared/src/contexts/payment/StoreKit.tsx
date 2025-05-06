import React, { useMemo } from 'react';
import type { ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  PaymentContextProviderProps,
  PaymentContextData,
} from './context';
import { PaymentContext } from './context';
import { iOSSupportsPlusPurchase } from '../../lib/ios';
import { useAuthContext } from '../AuthContext';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { ProductPricingMetadata } from '../../graphql/paddle';
import { fetchPricingMetadata, ProductPricingType } from '../../graphql/paddle';
import type { IAPProduct, PurchaseEventName } from './common';
import { getApplePricing } from './common';
import { useStoreKitPayment } from '../../hooks/payment/useStoreKitPayment';

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
  const { user, isValidRegion: isPlusAvailable } = useAuthContext();

  const { data: metadata } = useQuery<ProductPricingMetadata[]>({
    queryKey: generateQueryKey(
      RequestKey.PriceMetadata,
      user,
      ProductPricingType.Plus,
    ),
    queryFn: () => fetchPricingMetadata(ProductPricingType.Plus),
    enabled: !!user && iOSSupportsPlusPurchase(),
    staleTime: StaleTime.Default,
  });

  const { data: products } = useQuery({
    queryKey: generateQueryKey(
      RequestKey.PricePreview,
      user,
      ProductPricingType.Plus,
    ),
    enabled: !!metadata?.length && iOSSupportsPlusPurchase(),
    staleTime: StaleTime.Default,
    queryFn: async () => getApplePricing(metadata),
  });
  const { openCheckout } = useStoreKitPayment({
    type: ProductPricingType.Plus,
    products,
    successCallback,
  });

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
