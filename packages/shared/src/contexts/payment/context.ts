import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { Paddle, TimePeriod } from '@paddle/paddle-js';
import type {
  PlusPriceType,
  PlusPriceTypeAppsId,
} from '../../lib/featureValues';

export type ProductOption = {
  label: string;
  value: string;
  price: {
    amount: number;
    formatted: string;
    monthlyAmount: number;
    monthlyFormatted: string;
  };
  currencyCode?: string;
  currencySymbol?: string;
  extraLabel: string;
  appsId: PlusPriceTypeAppsId;
  duration: PlusPriceType;
  durationLabel: 'month' | 'year';
  trialPeriod: TimePeriod | null;
};

export interface OpenCheckoutProps {
  priceId: string;
  giftToUserId?: string;
}

export type OpenCheckoutFn = (props: OpenCheckoutProps) => void;

export interface PaymentContextData {
  openCheckout?: OpenCheckoutFn;
  paddle?: Paddle | undefined;
  productOptions?: ProductOption[];
  earlyAdopterPlanId?: string | null;
  isPlusAvailable: boolean;
  giftOneYear?: ProductOption;
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
