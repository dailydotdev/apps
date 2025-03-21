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
import { CheckoutEventNames, initializePaddle } from '@paddle/paddle-js';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { checkIsExtension } from '../lib/func';
import type { OpenCheckoutFn } from './payment/context';
import { useAuthContext } from './AuthContext';
import type { Origin } from '../lib/log';
import { transactionPricesQueryOptions } from '../graphql/njord';

const SCREENS = {
  INTRO: 'INTRO',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
} as const;
export type Screens = keyof typeof SCREENS;

type CoreProductOption = {
  id: string;
  value: number;
};

export type BuyCoresContextData = {
  paddle?: Paddle | undefined;
  openCheckout?: OpenCheckoutFn;
  amountNeeded?: number;
  onCompletion?: () => void;
  selectedProduct?: CoreProductOption;
  setSelectedProduct: (product: CoreProductOption) => void;
  activeStep: Screens;
  setActiveStep: ({
    step,
    providerTransactionId,
  }: {
    step: Screens;
    providerTransactionId?: string;
  }) => void;
  providerTransactionId?: string;
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
  const [activeStep, setActiveStep] = useState<{
    step: Screens;
    providerTransactionId?: string;
  }>({
    step: SCREENS.INTRO,
  });
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    value: number;
  }>();
  const [paddle, setPaddle] = useState<Paddle>();
  const isCheckoutOpenRef = React.useRef(false);

  useEffect(() => {
    if (checkIsExtension()) {
      // Payment not available on extension
      return;
    }

    isCheckoutOpenRef.current = false;

    // TODO feat/transactions disabled for now since it looks like existing paddle instance does not load
    // const existingPaddleInstance = getPaddleInstance();
    // if (existingPaddleInstance) {
    //   setPaddle(existingPaddleInstance);
    //   return;
    // }

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
            setActiveStep({
              step: SCREENS.PROCESSING,
              providerTransactionId: event.data.transaction_id,
            });

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
      activeStep: activeStep.step,
      setActiveStep,
      selectedProduct,
      setSelectedProduct,
      openCheckout,
      providerTransactionId: activeStep.providerTransactionId,
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

export const useCoreProductOptionQuery = (): CoreProductOption => {
  const { user, isLoggedIn } = useAuthContext();
  const router = useRouter();
  const pid = router?.query?.pid;

  const { data: prices } = useQuery(
    transactionPricesQueryOptions({
      user,
      isLoggedIn,
    }),
  );

  return useMemo(() => {
    const price = prices?.find((item) => item.value === pid);

    if (!price) {
      return undefined;
    }

    return {
      id: price.value,
      value: price.coresValue,
    };
  }, [prices, pid]);
};
