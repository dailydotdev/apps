import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  initializePaddle,
  Paddle,
  PricePreviewResponse,
} from '@paddle/paddle-js';
import { useQuery } from '@tanstack/react-query';
import { planTypes } from '../lib/paddle';
import { useAuthContext } from './AuthContext';

export interface PaymentContextData {
  openCheckout?: ({ priceId: string }) => void;
  productPrices?: PricePreviewResponse;
}

const PaymentContext = React.createContext<PaymentContextData>({});
export default PaymentContext;

export type PaymentContextProviderProps = {
  children?: ReactNode;
};

export const PaymentContextProvider = ({
  children,
}: PaymentContextProviderProps): ReactElement => {
  const { user } = useAuthContext();
  const [paddle, setPaddle] = useState<Paddle>();

  // Download and initialize Paddle instance from CDN
  useEffect(() => {
    initializePaddle({
      environment: 'sandbox',
      token: process.env.NEXT_PUBLIC_PADDLE_TOKEN,
    }).then((paddleInstance: Paddle | undefined) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    });
  }, []);

  const openCheckout = useCallback(
    ({ priceId }: { priceId: string }) => {
      paddle?.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: {
          user_id: user.id,
        },
        settings: {
          displayMode: 'inline',
          frameTarget: 'checkout-container',
          frameInitialHeight: 450,
          frameStyle:
            'width: 100%; background-color: transparent; border: none;',
        },
      });
    },
    [paddle?.Checkout, user.id],
  );

  const getPrices = useCallback(() => {
    return paddle
      ?.PricePreview({
        items: Object.values(planTypes).map((priceId) => ({
          priceId,
          quantity: 1,
        })),
      })
      .then((response) => response);
  }, [paddle]);

  const { data: productPrices } = useQuery({
    queryKey: ['productPrices'],
    queryFn: async () => {
      return getPrices();
    },
    enabled: !!paddle,
  });

  const contextData = useMemo<PaymentContextData>(
    () => ({
      openCheckout,
      productPrices,
    }),
    [openCheckout, productPrices],
  );

  return (
    <PaymentContext.Provider value={contextData}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentContext = (): PaymentContextData =>
  useContext(PaymentContext);
