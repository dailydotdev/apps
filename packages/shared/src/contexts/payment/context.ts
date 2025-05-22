import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext } from 'react';
import type {
  ProductPricingPreview,
  ProductPricingType,
} from '../../graphql/paddle';

export interface OpenCheckoutProps {
  priceId: string;
  giftToUserId?: string;
  customData?: Record<string, unknown>;
  discountId?: string;
  quantity?: number;
}

export type OpenCheckoutFn = (props: OpenCheckoutProps) => void;

export interface PaymentContextData {
  openCheckout?: OpenCheckoutFn;
  productOptions?: ProductPricingPreview[];
  isPlusAvailable: boolean;
  giftOneYear?: ProductPricingPreview;
  isPricesPending: boolean;
  isPaddleReady?: boolean;
  isOrganization?: boolean;
  toggleOrganization?: () => void;
  priceType: ProductPricingType;
  setPriceType: Dispatch<SetStateAction<ProductPricingType>>;
  itemQuantity?: number;
  setItemQuantity?: Dispatch<SetStateAction<number>>;
  checkoutItemsLoading?: boolean;
}

export const PaymentContext = createContext<PaymentContextData>(undefined);

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
}

export const FunnelPaymentPricingContext = createContext<{
  pricing: ProductPricingPreview[] | null;
}>({ pricing: null });

export const useFunnelPaymentPricingContext = () =>
  useContext(FunnelPaymentPricingContext);
