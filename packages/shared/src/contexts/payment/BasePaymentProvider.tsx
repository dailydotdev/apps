import type { PropsWithChildren, ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { OpenCheckoutProps, PaymentContextData } from './context';
import { PaymentContext } from './context';
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
  const { isValidRegion: isPlusAvailable } = useAuthContext();
  const { data, isPending: isPricesPending } = useProductPricing({
    type: ProductPricingType.Plus,
  });

  const giftOneYear = useMemo(
    () =>
      data?.find(
        ({ metadata }) => metadata.appsId === PlusPriceTypeAppsId.GiftOneYear,
      ),
    [data],
  );

  const value = useMemo<PaymentContextData>(
    () => ({
      openCheckout,
      productOptions:
        data?.filter(({ priceId }) => priceId !== giftOneYear?.priceId) ?? [],
      isPlusAvailable,
      giftOneYear,
      isPricesPending,
      isPaddleReady,
    }),
    [
      openCheckout,
      data,
      giftOneYear,
      isPlusAvailable,
      isPricesPending,
      isPaddleReady,
    ],
  );

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
};
