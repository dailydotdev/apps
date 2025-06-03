import type { PropsWithChildren, ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import type { OpenCheckoutProps, PaymentContextData } from './context';
import {
  PaymentContext,
  priceTypeAtom,
  useFunnelPaymentPricingContext,
} from './context';
import { PurchaseType } from '../../graphql/paddle';
import { PlusPriceTypeAppsId } from '../../lib/featureValues';
import { useProductPricing } from '../../hooks/useProductPricing';
import { useAuthContext } from '../AuthContext';

interface BasePaymentProviderProps {
  openCheckout: (props: OpenCheckoutProps) => void;
  isPaddleReady?: boolean;
  checkoutItemsLoading?: boolean;
  initialPriceType?: PurchaseType;
}

export const BasePaymentProvider = ({
  children,
  openCheckout,
  isPaddleReady,
  checkoutItemsLoading,
}: PropsWithChildren<BasePaymentProviderProps>): ReactElement => {
  const priceType = useAtomValue(priceTypeAtom);
  const { isValidRegion: isPlusAvailable } = useAuthContext();
  const { pricing: funnelPricing } = useFunnelPaymentPricingContext() ?? {};
  const { data: plusPricing, isPending: isPricesPending } = useProductPricing({
    type: priceType,
    enabled: !funnelPricing,
  });
  const data = funnelPricing ?? plusPricing;

  const giftOneYear = useMemo(
    () =>
      data?.find(
        ({ metadata }) => metadata.appsId === PlusPriceTypeAppsId.GiftOneYear,
      ),
    [data],
  );

  const isOrganization = priceType === PurchaseType.Organization;

  const value = useMemo<PaymentContextData>(
    () => ({
      openCheckout,
      productOptions:
        data?.filter(({ priceId }) => priceId !== giftOneYear?.priceId) ?? [],
      isPlusAvailable,
      giftOneYear,
      isPricesPending,
      isPaddleReady,
      isOrganization,
      checkoutItemsLoading,
    }),
    [
      openCheckout,
      data,
      giftOneYear,
      isPlusAvailable,
      isPricesPending,
      isPaddleReady,
      isOrganization,
      checkoutItemsLoading,
    ],
  );

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
};
