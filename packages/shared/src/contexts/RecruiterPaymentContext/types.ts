import type { Paddle } from '@paddle/paddle-js';
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { OpenCheckoutFn } from '../payment/context';
import type { Origin } from '../../lib/log';
import type { ProductPricingPreview } from '../../graphql/paddle';

export const RecruiterPaymentContext =
  createContext<RecruiterPaymentContextData>(undefined);

export const useRecruiterPaymentContext = (): RecruiterPaymentContextData =>
  useContext(RecruiterPaymentContext);

export type RecruiterProductOption = {
  id: string;
};

export type ProcessingError = {
  title: string;
  description?: string;
  onRequestClose?: () => void;
};

export type RecruiterPaymentContextData = {
  paddle?: Paddle | undefined;
  openCheckout?: OpenCheckoutFn<{ opportunity_id: string }>;
  onCompletion?: () => void;
  selectedProduct?: RecruiterProductOption;
  setSelectedProduct: (product: RecruiterProductOption) => void;
  error?: ProcessingError;
  origin?: Origin;
  prices?: ProductPricingPreview[];
};

export type RecruiterContextProviderProps = {
  children?: ReactNode;
  origin?: Origin;
  onCompletion?: () => void;
};
