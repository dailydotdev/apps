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
  Environments,
  Paddle,
  PaddleEventData,
  TimePeriod,
} from '@paddle/paddle-js';
import {
  CheckoutEventNames,
  getPaddleInstance,
  initializePaddle,
} from '@paddle/paddle-js';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useAuthContext } from './AuthContext';
import { plusSuccessUrl } from '../lib/constants';
import { LogEvent } from '../lib/log';
import { usePlusSubscription } from '../hooks';
import { feature } from '../lib/featureManagement';
import { PlusPriceType, PlusPriceTypeAppsId } from '../lib/featureValues';
import { getPrice } from '../lib';
import { useFeature } from '../components/GrowthBookProvider';
import { PixelsContext } from './PixelsContext';

export type ProductOption = {
  label: string;
  value: string;
  price: {
    amount: number;
    formatted: string;
    monthlyAmount: number;
    monthlyFormatted: string;
  };
  currencyCode: string;
  currencySymbol: string;
  extraLabel: string;
  appsId: PlusPriceTypeAppsId;
  duration: PlusPriceType;
  trialPeriod: TimePeriod | null;
};

interface OpenCheckoutProps {
  priceId: string;
  giftToUserId?: string;
}

export type OpenCheckoutFn = (props: OpenCheckoutProps) => void;

export interface PaymentContextData {
  openCheckout?: OpenCheckoutFn;
  paddle?: Paddle | undefined;
  productOptions?: ProductOption[];
  earlyAdopterPlanId?: string | null;
  isPlusAvailable: boolean;
  giftOneYear?: ProductOption;
  isPricesPending: boolean;
  isFreeTrialExperiment: boolean;
}

const PaymentContext = React.createContext<PaymentContextData>(undefined);
export default PaymentContext;

export type PaymentContextProviderProps = {
  children?: ReactNode;
};

export const PaymentContextProvider = ({
  children,
}: PaymentContextProviderProps): ReactElement => {
  const router = useRouter();
  const { user, geo, isValidRegion: isPlusAvailable } = useAuthContext();
  const { trackPayment } = useContext(PixelsContext);
  const planTypes = useFeature(feature.pricingIds);
  const [paddle, setPaddle] = useState<Paddle>();
  const { logSubscriptionEvent, isPlus } = usePlusSubscription();
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
              event_name:
                'gifter_id' in event.data.custom_data
                  ? LogEvent.CompleteGiftCheckout
                  : LogEvent.CompleteCheckout,
              extra: {
                user_id:
                  'gifter_id' in event.data.custom_data &&
                  'user_id' in event.data.custom_data
                    ? event.data.custom_data.user_id
                    : undefined,
                cycle:
                  event?.data.items?.[0]?.billing_cycle?.interval ?? 'one-off',
                localCost: event?.data.totals.total,
                localCurrenct: event?.data.currency_code,
                payment: event?.data.payment.method_details.type,
              },
            });
            trackPayment(
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

  const { data: productPrices, isLoading: isPricesPending } = useQuery({
    queryKey: ['productPrices', user, planTypes],
    queryFn: getPrices,
    enabled: !!paddle && !!planTypes && !!geo && !!user,
  });

  const productOptions: Array<ProductOption> = useMemo(() => {
    const priceFormatter = new Intl.NumberFormat(
      globalThis?.navigator?.language ?? 'en-US',
      {
        minimumFractionDigits: 2,
      },
    );
    return (
      productPrices?.data?.details?.lineItems?.map((item) => {
        const isOneOff = !item.price?.billingCycle?.interval;
        const isYearly = item.price?.billingCycle?.interval === 'year';
        const duration =
          isOneOff || isYearly ? PlusPriceType.Yearly : PlusPriceType.Monthly;
        const priceAmount = getPrice(item);
        const months = duration === PlusPriceType.Yearly ? 12 : 1;
        const monthlyPrice = Number(
          (priceAmount / months).toString().match(/^-?\d+(?:\.\d{0,2})?/)[0],
        );
        const currencyCode = productPrices?.data.currencyCode;
        const currencySymbol = item.formattedTotals.total.replace(
          /\d|\.|\s|,/g,
          '',
        );
        return {
          label: item.price.name,
          value: item.price.id,
          price: {
            amount: priceAmount,
            formatted: item.formattedTotals.total,
            monthlyAmount: monthlyPrice,
            monthlyFormatted: `${currencySymbol}${priceFormatter.format(
              monthlyPrice,
            )}`,
          },
          currencyCode,
          currencySymbol,
          extraLabel: item.price.customData?.label as string,
          appsId:
            (item.price.customData?.appsId as PlusPriceTypeAppsId) ??
            PlusPriceTypeAppsId.Default,
          duration,
          trialPeriod: item.price.trialPeriod,
        };
      }) ?? []
    );
  }, [productPrices?.data]);

  const earlyAdopterPlanId: PaymentContextData['earlyAdopterPlanId'] = useMemo(
    () =>
      productOptions.find(
        ({ appsId }) => appsId === PlusPriceTypeAppsId.EarlyAdopter,
      )?.value,
    [productOptions],
  );

  const giftOneYear: ProductOption = useMemo(
    () =>
      productOptions.find(
        ({ appsId }) => appsId === PlusPriceTypeAppsId.GiftOneYear,
      ),
    [productOptions],
  );

  const isFreeTrialExperiment = useMemo(
    () => productOptions.some(({ trialPeriod }) => !!trialPeriod),
    [productOptions],
  );

  const openCheckout = useCallback(
    ({ priceId, giftToUserId }: OpenCheckoutProps) => {
      if (isPlus && priceId !== giftOneYear?.value) {
        return;
      }

      if (!isPlusAvailable) {
        return;
      }

      paddle?.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: {
          email: user?.email,
        },
        customData: {
          user_id: giftToUserId ?? user?.id,
          ...(!!giftToUserId && { gifter_id: user?.id }),
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
    [
      giftOneYear?.value,
      isPlus,
      isPlusAvailable,
      paddle?.Checkout,
      user?.email,
      user?.id,
    ],
  );

  const contextData = useMemo<PaymentContextData>(
    () => ({
      openCheckout,
      paddle,
      productOptions: productOptions.filter(
        ({ value }) => value !== giftOneYear?.value,
      ),
      earlyAdopterPlanId,
      isPlusAvailable,
      giftOneYear,
      isPricesPending,
      isFreeTrialExperiment,
    }),
    [
      giftOneYear,
      earlyAdopterPlanId,
      openCheckout,
      paddle,
      productOptions,
      isPlusAvailable,
      isPricesPending,
      isFreeTrialExperiment,
    ],
  );

  return (
    <PaymentContext.Provider value={contextData}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentContext = (): PaymentContextData =>
  useContext(PaymentContext);
