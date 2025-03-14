import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Environments, Paddle, PaddleEventData } from '@paddle/paddle-js';
import {
  CheckoutEventNames,
  getPaddleInstance,
  initializePaddle,
} from '@paddle/paddle-js';
import { checkIsExtension } from '../lib/func';
import type { OpenCheckoutFn } from './PaymentContext';
import { useAuthContext } from './AuthContext';
import type { Origin } from '../lib/log';

const SCREENS = {
  INTRO: 'INTRO',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
} as const;
export type Screens = keyof typeof SCREENS;

export type BuyCoresContextData = {
  paddle?: Paddle | undefined;
  openCheckout?: OpenCheckoutFn;
  amountNeeded?: number;
  onCompletion?: () => void;
  selectedProduct?: string;
  setSelectedProduct: (product: string) => void;
  activeStep: Screens;
  setActiveStep: (step: Screens) => void;
  origin?: Origin;
};

const BuyCoresContext = React.createContext<BuyCoresContextData>(undefined);
export default BuyCoresContext;

export type BuyCoresContextProviderProps = {
  children?: ReactNode;
  origin: Origin;
  amountNeeded?: number;
  onCompletion?: () => void;
};

export const BuyCoresContextProvider = ({
  onCompletion,
  origin,
  amountNeeded,
  children,
}: BuyCoresContextProviderProps): ReactElement => {
  const { user } = useAuthContext();
  const [activeStep, setActiveStep] = useState<Screens>(SCREENS.INTRO);
  const [selectedProduct, setSelectedProduct] = useState<string>();
  const [paddle, setPaddle] = useState<Paddle>();

  useEffect(() => {
    if (checkIsExtension()) {
      // Payment not available on extension
      return;
    }
    const existingPaddleInstance = getPaddleInstance();
    if (existingPaddleInstance) {
      setPaddle(existingPaddleInstance);
      return;
    }

    initializePaddle({
      environment:
        (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as Environments) ||
        'production',
      token: process.env.NEXT_PUBLIC_PADDLE_TOKEN,
      eventCallback: (event: PaddleEventData) => {
        switch (event?.name) {
          case CheckoutEventNames.CHECKOUT_PAYMENT_SELECTED:
            break;
          case CheckoutEventNames.CHECKOUT_COMPLETED:
            break;
          // This doesn't exist in the original code
          case 'checkout.warning' as CheckoutEventNames:
            break;
          case CheckoutEventNames.CHECKOUT_ERROR:
            break;
          default:
            break;
        }
      },
    }).then((paddleInstance: Paddle | undefined) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    });
  }, []);

  const openCheckout = useCallback(
    ({ priceId }) => {
      paddle?.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: {
          email: user?.email,
        },
        settings: {
          displayMode: 'inline',
          frameTarget: 'checkout-container',
          frameInitialHeight: 500,
          frameStyle:
            'width: 100%; background-color: transparent; border: none;',
          theme: 'dark',
        },
      });
    },
    [paddle?.Checkout, user?.email],
  );

  const contextData = useMemo<BuyCoresContextData>(
    () => ({
      paddle,
      amountNeeded,
      onCompletion,
      activeStep,
      setActiveStep,
      selectedProduct,
      setSelectedProduct,
      openCheckout,
      origin,
    }),
    [
      activeStep,
      amountNeeded,
      onCompletion,
      openCheckout,
      origin,
      paddle,
      selectedProduct,
    ],
  );

  return (
    <BuyCoresContext.Provider value={contextData}>
      {children}
    </BuyCoresContext.Provider>
  );
};

export const useBuyCoresContext = (): BuyCoresContextData =>
  useContext(BuyCoresContext);
