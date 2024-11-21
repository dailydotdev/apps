import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  CheckoutEventNames,
  Environments,
  getPaddleInstance,
  initializePaddle,
  Paddle,
  type PaddleEventData,
} from '@paddle/paddle-js';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from './AuthContext';
import { generateQueryKey, RequestKey } from '../lib/query';
import { getPricingIds } from '../graphql/paddle';
import { plusSuccessUrl } from '../lib/constants';
import { LogEvent } from '../lib/log';
import { usePlusSubscription } from '../hooks/usePlusSubscription';
import { logPixelPayment } from '../components/Pixels';

export type ProductOption = {
  label: string;
  value: string;
  price: string;
  currencyCode: string;
  extraLabel: string;
};
export interface PaymentContextData {
  openCheckout?: ({ priceId }: { priceId: string }) => void;
  paddle?: Paddle | undefined;
  productOptions?: ProductOption[];
}

const PaymentContext = React.createContext<PaymentContextData>({});
export default PaymentContext;

export type PaymentContextProviderProps = {
  children?: ReactNode;
};

export const PaymentContextProvider = ({
  children,
}: PaymentContextProviderProps): ReactElement => {
  const { user, geo } = useAuthContext();
  const [paddle, setPaddle] = useState<Paddle>();
  const { logSubscriptionEvent } = usePlusSubscription();
  const logRef = useRef<typeof logSubscriptionEvent>();
  logRef.current = logSubscriptionEvent;

  // Download and initialize Paddle instance from CDN
  useEffect(() => {
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
            logRef.current({
              event_name: LogEvent.SelectCheckoutPayment,
              target_id: event?.data?.payment.method_details.type,
            });
            break;
          case CheckoutEventNames.CHECKOUT_COMPLETED:
            logRef.current({
              event_name: LogEvent.CompleteCheckout,
              extra: {
                cycle: event?.data.items?.[0]?.billing_cycle.interval,
                localCost: event?.data.totals.total,
                localCurrenct: event?.data.currency_code,
                payment: event?.data.payment.method_details.type,
              },
            });
            logPixelPayment(
              event?.data.totals.total,
              event?.data.currency_code,
              event?.data?.transaction_id,
            );
            break;
          // This doesn't exist in the original code
          case 'checkout.warning' as CheckoutEventNames:
            logRef.current({
              event_name: LogEvent.WarningCheckout,
            });
            break;
          case CheckoutEventNames.CHECKOUT_ERROR:
            logRef.current({
              event_name: LogEvent.ErrorCheckout,
            });
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
          frameInitialHeight: 500,
          frameStyle:
            'width: 100%; background-color: transparent; border: none;',
          theme: 'dark',
          successUrl: plusSuccessUrl,
          showAddDiscounts: false,
        },
      });
    },
    [paddle, user],
  );

  const { data: planTypes } = useQuery({
    queryKey: generateQueryKey(RequestKey.PlanTypes),
    queryFn: getPricingIds,
  });

  const getPrices = useCallback(async () => {
    return paddle?.PricePreview({
      items: Object.keys(planTypes).map((priceId) => ({
        priceId,
        quantity: 1,
      })),
      address: geo?.region && {
        countryCode: geo.region,
      },
    });
  }, [paddle, planTypes, geo?.region]);

  const { data: productPrices } = useQuery({
    queryKey: ['productPrices'],
    queryFn: getPrices,
    enabled: !!paddle && !!planTypes && !!geo,
  });

  const productOptions = useMemo(
    () =>
      productPrices?.data?.details?.lineItems?.map((item) => ({
        label: item.price.description,
        value: item.price.id,
        price: item.formattedTotals.total,
        currencyCode: productPrices?.data.currencyCode as string,
        extraLabel: item.price.customData?.label as string,
      })) ?? [],
    [productPrices?.data.currencyCode, productPrices?.data?.details?.lineItems],
  );

  const contextData = useMemo<PaymentContextData>(
    () => ({
      openCheckout,
      paddle,
      productOptions,
    }),
    [openCheckout, paddle, productOptions],
  );

  return (
    <PaymentContext.Provider value={contextData}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentContext = (): PaymentContextData =>
  useContext(PaymentContext);
