import type {
  Dispatch,
  PropsWithChildren,
  ReactElement,
  SetStateAction,
} from 'react';
import React, { useCallback, useMemo } from 'react';
import type {
  OpenCheckoutFn,
  OpenCheckoutProps,
  PaymentContextData,
} from './context';
import { PaymentContext, useFunnelPaymentPricingContext } from './context';
import { PurchaseType } from '../../graphql/paddle';
import { PlusPriceTypeAppsId } from '../../lib/featureValues';
import { useProductPricing } from '../../hooks/useProductPricing';
import { useAuthContext } from '../AuthContext';

interface BasePaymentProviderProps {
  openCheckout: (props: OpenCheckoutProps) => void;
  isPaddleReady?: boolean;
  checkoutItemsLoading?: boolean;
  priceType: PurchaseType;
  setPriceType?: Dispatch<SetStateAction<PurchaseType>>;
  discountId?: string;
}

export const BasePaymentProvider = ({
  children,
  openCheckout,
  isPaddleReady,
  checkoutItemsLoading,
  priceType,
  setPriceType,
  discountId,
}: PropsWithChildren<BasePaymentProviderProps>): ReactElement => {
  const { isValidRegion: isPlusAvailable } = useAuthContext();
  const { pricing: funnelPricing } = useFunnelPaymentPricingContext() ?? {};
  const { data: plusPricing, isPending: isPricesPending } = useProductPricing({
    type: priceType,
    enabled: !funnelPricing?.length,
    discountId,
  });
  const data = funnelPricing?.length ? funnelPricing : plusPricing;

  const openCheckoutWithDiscount = useCallback<OpenCheckoutFn>(
    (props) =>
      openCheckout({
        ...props,
        // Gifting buys a separate one-off product, not a subscription, so a
        // subscription sale must not follow the buyer into the gift checkout.
        discountId:
          props.discountId ?? (props.giftToUserId ? undefined : discountId),
      }),
    [openCheckout, discountId],
  );

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
      openCheckout: openCheckoutWithDiscount,
      productOptions:
        data?.filter(({ priceId }) => priceId !== giftOneYear?.priceId) ?? [],
      isPlusAvailable: isPlusAvailable ?? false,
      giftOneYear,
      isPricesPending,
      isPaddleReady: isPaddleReady ?? false,
      isOrganization,
      checkoutItemsLoading,
      priceType,
      setPriceType,
    }),
    [
      openCheckoutWithDiscount,
      data,
      giftOneYear,
      isPlusAvailable,
      isPricesPending,
      isPaddleReady,
      isOrganization,
      checkoutItemsLoading,
      priceType,
      setPriceType,
    ],
  );

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
};
