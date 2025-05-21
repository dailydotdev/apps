import type { PropsWithChildren, ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import type { OpenCheckoutProps, PaymentContextData } from './context';
import { PaymentContext, useFunnelPaymentPricingContext } from './context';
import { ProductPricingType } from '../../graphql/paddle';
import { PlusPriceTypeAppsId } from '../../lib/featureValues';
import { useProductPricing } from '../../hooks/useProductPricing';
import { useAuthContext } from '../AuthContext';

interface BasePaymentProviderProps {
  openCheckout: (props: OpenCheckoutProps) => void;
  isPaddleReady?: boolean;
}

export const BasePaymentProvider = ({
  children,
  openCheckout,
  isPaddleReady,
}: PropsWithChildren<BasePaymentProviderProps>): ReactElement => {
  const [priceType, setPriceType] = useState<ProductPricingType>(
    ProductPricingType.Plus,
  );
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

  const isOrganization = priceType === ProductPricingType.PlusOrganization;

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
      priceType,
      setPriceType,
    }),
    [
      openCheckout,
      data,
      giftOneYear,
      isPlusAvailable,
      isPricesPending,
      isPaddleReady,
      isOrganization,
      priceType,
    ],
  );

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
};
