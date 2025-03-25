import type { ReactNode } from 'react';
import type { PlusPriceType, PlusPriceTypeAppsId } from '../../lib/featureValues';

export interface ProductOption {
  label: string;
  value: string;
  price: {
    amount: number;
    formatted: string;
    monthlyAmount?: number;
    monthlyFormatted?: string;
  };
  currencyCode?: string;
  currencySymbol?: string;
  extraLabel: string;
  appsId: PlusPriceTypeAppsId;
  duration: PlusPriceType;
  durationLabel: 'month' | 'year';
  trialPeriod: {
    interval: string;
    frequency: number;
  } | null;
}

export interface OpenCheckoutProps {
  priceId: string;
  giftToUserId?: string;
}

export interface PaymentProvider {
  initialize(): Promise<void>;
  openCheckout(props: OpenCheckoutProps): void;
  getProductOptions(): Promise<ProductOption[]>;
  isAvailable(): boolean;
  cleanup?(): void;
}

export interface PaymentContextData {
  openCheckout?: (props: OpenCheckoutProps) => void;
  productOptions?: ProductOption[];
  earlyAdopterPlanId?: string | null;
  isPlusAvailable: boolean;
  giftOneYear?: ProductOption;
  isPricesPending: boolean;
  isFreeTrialExperiment: boolean;
}

export interface PaymentContextProviderProps {
  children?: ReactNode;
} 