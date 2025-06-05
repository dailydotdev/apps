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
import { fetchPricingMetadata, PurchaseType } from '../../graphql/paddle';
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
      PurchaseType.Plus,
    ),
    queryFn: () => fetchPricingMetadata(PurchaseType.Plus),
    enabled: !!user && iOSSupportsPlusPurchase(),
    staleTime: StaleTime.Default,
  });

  const { data: products } = useQuery({
    queryKey: generateQueryKey(
      RequestKey.PricePreview,
      user,
      PurchaseType.Plus,
    ),
    enabled: !!metadata?.length && iOSSupportsPlusPurchase(),
    staleTime: StaleTime.Default,
    queryFn: async () => getApplePricing(metadata),
  });
  const { openCheckout } = useStoreKitPayment({
    type: PurchaseType.Plus,
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
    }),
    [isPlusAvailable, openCheckout, products],
  );

  return (
    <PaymentContext.Provider value={contextData}>
      {children}
    </PaymentContext.Provider>
  );
};
