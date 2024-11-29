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
import { useRouter } from 'next/router';
import { useAuthContext } from './AuthContext';
import { plusSuccessUrl } from '../lib/constants';
import { LogEvent } from '../lib/log';
import { usePlusSubscription } from '../hooks';
import { logPixelPayment } from '../components/Pixels';
import { useFeature } from '../components/GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import { PlusPriceType } from '../lib/featureValues';

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
  earlyAdopterPlanId?: string | null;
}

const PaymentContext = React.createContext<PaymentContextData>({});
export default PaymentContext;

export type PaymentContextProviderProps = {
  children?: ReactNode;
};

export const PaymentContextProvider = ({
  children,
}: PaymentContextProviderProps): ReactElement => {
  const router = useRouter();
  const { user, geo } = useAuthContext();
  const planTypes = useFeature(feature.pricingIds);
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
            router.push(plusSuccessUrl);
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
  }, [router]);

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
          showAddDiscounts: false,
        },
      });
    },
    [paddle, user],
  );

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

  const earlyAdopterPlanId: PaymentContextData['earlyAdopterPlanId'] =
    useMemo(() => {
      const monthlyPrices = productOptions.filter(
        (option) => planTypes[option.value] === PlusPriceType.Monthly,
      );

      if (monthlyPrices.length <= 1) {
        return null;
      }

      return monthlyPrices.reduce((acc, plan) => {
        return acc.price < plan.price ? acc : plan;
      }).value;
    }, [planTypes, productOptions]);

  const contextData = useMemo<PaymentContextData>(
    () => ({
      openCheckout,
      paddle,
      productOptions,
      earlyAdopterPlanId,
    }),
    [earlyAdopterPlanId, openCheckout, paddle, productOptions],
  );

  return (
    <PaymentContext.Provider value={contextData}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentContext = (): PaymentContextData =>
  useContext(PaymentContext);
