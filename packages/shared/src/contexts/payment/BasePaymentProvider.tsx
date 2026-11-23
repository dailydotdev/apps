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
  // Discount the open checkout applied (coupon, `d_id`, sale); null for none.
  // undefined until a checkout has loaded.
  appliedDiscountId?: string | null;
}

export const BasePaymentProvider = ({
  children,
  openCheckout,
  isPaddleReady,
  checkoutItemsLoading,
  priceType,
  setPriceType,
  discountId,
  appliedDiscountId,
}: PropsWithChildren<BasePaymentProviderProps>): ReactElement => {
  const { isValidRegion: isPlusAvailable } = useAuthContext();
  const { pricing: funnelPricing } = useFunnelPaymentPricingContext() ?? {};
  const effectiveDiscountId =
    appliedDiscountId === undefined
      ? discountId
      : (appliedDiscountId ?? undefined);
  const { data: plusPricing, isPending: isPricesPending } = useProductPricing({
    type: priceType,
    enabled: !funnelPricing?.length,
    discountId: effectiveDiscountId,
  });
  const { data: regularPricing } = useProductPricing({
    type: priceType,
    enabled: !funnelPricing?.length && !!effectiveDiscountId,
  });
  const discountedPricing = useMemo(() => {
    if (!effectiveDiscountId || !regularPricing?.length) {
      return plusPricing;
    }

    return plusPricing?.map((option) => {
      const regular = regularPricing.find(
        ({ priceId }) => priceId === option.priceId,
      );

      return regular && regular.price.amount > option.price.amount
        ? { ...option, originalPrice: regular.price }
        : option;
    });
  }, [effectiveDiscountId, plusPricing, regularPricing]);
  const data = funnelPricing?.length ? funnelPricing : discountedPricing;

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
