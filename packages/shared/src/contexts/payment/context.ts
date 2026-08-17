import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext } from 'react';
import type { ProductPricingPreview, PurchaseType } from '../../graphql/paddle';

export interface OpenCheckoutProps<TCustomData = Record<string, unknown>> {
  priceId: string;
  giftToUserId?: string;
  customData?: TCustomData;
  discountId?: string;
  quantity?: number;
}

export type OpenCheckoutFn<TCustomData = Record<string, unknown>> = (
  props: OpenCheckoutProps<TCustomData>,
) => void;

export interface PaymentContextData {
  openCheckout?: OpenCheckoutFn;
  productOptions?: ProductPricingPreview[];
  isPlusAvailable: boolean;
  giftOneYear?: ProductPricingPreview;
  isPricesPending: boolean;
  isPaddleReady?: boolean;
  isOrganization?: boolean;
  itemQuantity?: number;
  setItemQuantity?: Dispatch<SetStateAction<number>>;
  checkoutItemsLoading?: boolean;
  priceType?: PurchaseType;
  setPriceType?: Dispatch<SetStateAction<PurchaseType>>;
}

export const PaymentContext = createContext<PaymentContextData>(
  undefined as unknown as PaymentContextData,
);

export const usePaymentContext = (): PaymentContextData => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error(
      'usePaymentContext must be used within a PaymentContextProvider',
    );
  }
  return context;
};

export interface PaymentContextProviderProps<T = unknown, E = unknown> {
  children?: ReactNode;
  disabledEvents?: E[];
  successCallback?: (event: T) => void;
  initialPriceType?: PurchaseType;
  /**
   * Paddle discount applied to both the previewed prices and checkout for
   * everything under this provider. Opt-in per surface: the onboarding funnel
   * mounts its own provider without it and keeps its own discount logic.
   */
  discountId?: string;
}

export const FunnelPaymentPricingContext = createContext<{
  pricing: ProductPricingPreview[] | null;
}>({ pricing: null });

export const useFunnelPaymentPricingContext = () =>
  useContext(FunnelPaymentPricingContext);
