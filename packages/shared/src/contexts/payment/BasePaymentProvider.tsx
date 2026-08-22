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
  const saleDiscountId =
    priceType === PurchaseType.Plus ? discountId : undefined;
  const { data: plusPricing, isPending: isPricesPending } = useProductPricing({
    type: priceType,
    enabled: !funnelPricing?.length,
    discountId: saleDiscountId,
  });
  const data = funnelPricing?.length ? funnelPricing : plusPricing;

  const openCheckoutWithDiscount = useCallback<OpenCheckoutFn>(
    (props) => {
      const isSaleEligiblePrice =
        priceType === PurchaseType.Plus &&
        data?.some(({ priceId }) => priceId === props.priceId);

      openCheckout({
        ...props,
        // The sale only covers personal Plus prices. Gifting and organization
        // subscriptions must not inherit its Paddle discount.
        discountId:
          props.discountId ??
          (props.giftToUserId || !isSaleEligiblePrice
            ? undefined
            : saleDiscountId),
      });
    },
    [openCheckout, priceType, data, saleDiscountId],
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
