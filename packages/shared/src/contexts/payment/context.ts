import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { Paddle } from '@paddle/paddle-js';
import type { PlusPricingPreview } from '../../graphql/paddle';

export interface OpenCheckoutProps {
  priceId: string;
  giftToUserId?: string;
}

export type OpenCheckoutFn = (props: OpenCheckoutProps) => void;

export interface PaymentContextData {
  openCheckout?: OpenCheckoutFn;
  paddle?: Paddle | undefined;
  productOptions?: PlusPricingPreview[];
  isPlusAvailable: boolean;
  giftOneYear?: PlusPricingPreview;
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

export type PaymentContextProviderProps = {
  children?: ReactNode;
};
