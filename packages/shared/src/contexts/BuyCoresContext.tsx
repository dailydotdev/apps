import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  CheckoutCustomer,
  CheckoutLineItem,
  Environments,
  Paddle,
  PaddleEventData,
} from '@paddle/paddle-js';
import {
  CheckoutEventNames,
  getPaddleInstance,
  initializePaddle,
} from '@paddle/paddle-js';
import { checkIsExtension } from '../lib/func';
import type { OpenCheckoutFn } from './payment/context';
import { useAuthContext } from './AuthContext';

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
};

const BuyCoresContext = React.createContext<BuyCoresContextData>(undefined);
export default BuyCoresContext;

export type BuyCoresContextProviderProps = {
  children?: ReactNode;
  amountNeeded?: number;
  onCompletion?: () => void;
};

export const BuyCoresContextProvider = ({
  onCompletion,
  amountNeeded,
  children,
}: BuyCoresContextProviderProps): ReactElement => {
  const { user } = useAuthContext();
  const [activeStep, setActiveStep] = useState<Screens>(SCREENS.INTRO);
  const [selectedProduct, setSelectedProduct] = useState<string>();
  const [paddle, setPaddle] = useState<Paddle>();
  const isCheckoutOpenRef = React.useRef(false);

  useEffect(() => {
    if (checkIsExtension()) {
      // Payment not available on extension
      return;
    }

    isCheckoutOpenRef.current = false;

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
          case CheckoutEventNames.CHECKOUT_LOADED:
            isCheckoutOpenRef.current = true;
            break;
          case CheckoutEventNames.CHECKOUT_CLOSED:
            isCheckoutOpenRef.current = false;
            break;
          default:
            break;
        }
      },
      checkout: {
        settings: {
          displayMode: 'inline',
          frameTarget: 'checkout-container',
          frameInitialHeight: 500,
          frameStyle:
            'width: 100%; background-color: transparent; border: none;',
          theme: 'dark',
        },
      },
    }).then((paddleInstance: Paddle | undefined) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    });
  }, []);

  const openCheckout = useCallback(
    ({ priceId }) => {
      const items: CheckoutLineItem[] = [{ priceId, quantity: 1 }];
      const customer: CheckoutCustomer = {
        email: user?.email,
      };
      const customData = {
        user_id: user?.id,
      };

      if (isCheckoutOpenRef.current) {
        paddle?.Checkout.updateCheckout({
          items,
          customer,
          customData,
        });

        return;
      }

      paddle?.Checkout.open({
        items,
        customer,
        customData,
      });
    },
    [paddle?.Checkout, user?.email, user?.id],
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
    }),
    [
      activeStep,
      amountNeeded,
      onCompletion,
      openCheckout,
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
