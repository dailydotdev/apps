import type { Paddle } from '@paddle/paddle-js';
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { OpenCheckoutFn } from '../payment/context';
import type { Origin } from '../../lib/log';

export const BuyCoresContext = createContext<BuyCoresContextData>(undefined);

export const useBuyCoresContext = (): BuyCoresContextData =>
  useContext(BuyCoresContext);

export const SCREENS = {
  INTRO: 'INTRO',
  COMMENT: 'COMMENT',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  SUCCESS: 'SUCCESS',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
} as const;
export type Screens = keyof typeof SCREENS;

export type CoreProductOption = {
  id: string;
  value: number;
};

export type ProcessingError = {
  title: string;
  description?: string;
  onRequestClose?: () => void;
};

export type BuyCoresContextData = {
  paddle?: Paddle | undefined;
  openCheckout?: OpenCheckoutFn;
  amountNeeded?: number;
  onCompletion?: () => void;
  selectedProduct?: CoreProductOption;
  setSelectedProduct: (product: CoreProductOption) => void;
  activeStep: Screens;
  error?: ProcessingError;
  setActiveStep: ({
    step,
    providerTransactionId,
    error,
  }: {
    step: Screens;
    providerTransactionId?: string;
    error?: ProcessingError;
  }) => void;
  providerTransactionId?: string;
  origin?: Origin;
};

export type BuyCoresContextProviderProps = {
  children?: ReactNode;
  origin: Origin;
  amountNeeded?: number;
  onCompletion?: () => void;
};
