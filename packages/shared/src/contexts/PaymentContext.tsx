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
  Environments,
  initializePaddle,
  Paddle,
  PricePreviewResponse,
} from '@paddle/paddle-js';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from './AuthContext';
import { generateQueryKey, RequestKey } from '../lib/query';
import { getPricingIds } from '../graphql/paddle';

export interface PaymentContextData {
  openCheckout?: ({ priceId }: { priceId: string }) => void;
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
      environment:
        (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as Environments) ||
        'production',
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
        customer: {
          email: user?.email,
        },
        customData: {
          user_id: user?.id,
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
    [paddle?.Checkout, user],
  );

  const { data: planTypes } = useQuery({
    queryKey: generateQueryKey(RequestKey.PlanTypes),
    queryFn: getPricingIds,
  });

  const getPrices = useCallback(() => {
    return paddle
      ?.PricePreview({
        items: Object.keys(planTypes).map((priceId) => ({
          priceId,
          quantity: 1,
        })),
      })
      .then((response) => response);
  }, [paddle, planTypes]);

  const { data: productPrices } = useQuery({
    queryKey: ['productPrices'],
    queryFn: async () => {
      return getPrices();
    },
    enabled: !!paddle && !!planTypes,
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
