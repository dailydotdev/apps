import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { LogEvent, TargetType } from '../lib/log';
import {
  getQuantityForPrice,
  transactionPricesQueryOptions,
} from '../graphql/njord';
import { useLogContext } from './LogContext';

const SCREENS = {
  INTRO: 'INTRO',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
} as const;
export type Screens = keyof typeof SCREENS;

type CoreProductOption = {
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
  const { logEvent } = useLogContext();
  const { user, geo, isLoggedIn } = useAuthContext();
  const [activeStep, setActiveStep] = useState<{
    step: Screens;
    providerTransactionId?: string;
    error?: ProcessingError;
  }>({
    step: SCREENS.INTRO,
  });
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    value: number;
  }>();
  const [paddle, setPaddle] = useState<Paddle>();
  const isCheckoutOpenRef = React.useRef(false);
  const logRef = useRef<typeof logEvent>();
  logRef.current = logEvent;

  const { data: prices } = useQuery(
    transactionPricesQueryOptions({
      user,
      isLoggedIn,
    }),
  );

  const getQuantityForPriceFn = ({ priceId }: { priceId: string }) => {
    return getQuantityForPrice({ priceId, prices });
  };
  const getQuantityForPriceRef = useRef(getQuantityForPriceFn);
  getQuantityForPriceRef.current = getQuantityForPriceFn;

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
          case CheckoutEventNames.CHECKOUT_PAYMENT_INITIATED:
            logRef.current({
              event_name: LogEvent.InitiatePayment,
              target_type: TargetType.Credits,
              target_id: event?.data?.payment.method_details.type,
            });
            break;
          case CheckoutEventNames.CHECKOUT_LOADED:
            isCheckoutOpenRef.current = true;

            logRef.current({
              event_name: LogEvent.InitiateCheckout,
              target_type: TargetType.Credits,
              target_id: event?.data?.payment.method_details.type,
            });
            break;
          case CheckoutEventNames.CHECKOUT_PAYMENT_SELECTED:
            logRef.current({
              event_name: LogEvent.SelectCheckoutPayment,
              target_type: TargetType.Credits,
              target_id: event?.data?.payment.method_details.type,
            });
            break;
          case CheckoutEventNames.CHECKOUT_COMPLETED:
            logRef.current({
              event_name: LogEvent.CompleteCheckout,
              target_type: TargetType.Credits,
              extra: JSON.stringify({
                user_id:
                  'user_id' in event.data.custom_data
                    ? event.data.custom_data.user_id
                    : undefined,
                quantity: getQuantityForPriceRef.current({
                  priceId: event.data.items[0]?.price_id,
                }),
                localCost: event?.data.totals.total,
                localCurrency: event?.data.currency_code,
                payment: event?.data.payment.method_details.type,
              }),
            });

            setActiveStep({
              step: SCREENS.PROCESSING,
              providerTransactionId: event.data.transaction_id,
            });

            break;
          // This doesn't exist in the original code
          case 'checkout.warning' as CheckoutEventNames:
            logRef.current({
              event_name: LogEvent.WarningCheckout,
              target_type: TargetType.Credits,
            });
            break;
            break;
          case CheckoutEventNames.CHECKOUT_ERROR:
            logRef.current({
              event_name: LogEvent.ErrorCheckout,
              target_type: TargetType.Credits,
            });
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
          variant: 'one-page',
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
        ...(geo?.region && {
          address: {
            countryCode: geo?.region,
          },
        }),
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
    [paddle?.Checkout, user?.email, user?.id, geo?.region],
  );

  const contextData = useMemo<BuyCoresContextData>(
    () => ({
      paddle,
      amountNeeded,
      onCompletion,
      activeStep: activeStep.step,
      error: activeStep.error,
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
