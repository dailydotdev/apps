import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { Paddle } from '@paddle/paddle-js';
import type {
  ProductPricingPreview,
  ProductPricingType,
} from '../../graphql/paddle';

export interface OpenCheckoutProps {
  priceId: string;
  giftToUserId?: string;
}

export type OpenCheckoutFn = (props: OpenCheckoutProps) => void;

export interface PaymentContextData {
  openCheckout?: OpenCheckoutFn;
  paddle?: Paddle | undefined;
  productOptions?: ProductPricingPreview[];
  isPlusAvailable: boolean;
  giftOneYear?: ProductPricingPreview;
  isPricesPending: boolean;
  isFreeTrialExperiment: boolean;
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
  type: ProductPricingType;
  successCallback?: () => void;
  disabledEvents?: E[];
  eventsHandler?: (event: T) => void;
}
