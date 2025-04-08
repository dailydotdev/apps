import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
import type { PaddleEventData } from '@paddle/paddle-js';
import { CheckoutEventNames } from '@paddle/paddle-js';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useAuthContext } from '../AuthContext';
import { plusSuccessUrl } from '../../lib/constants';
import { usePlusSubscription } from '../../hooks';
import { feature } from '../../lib/featureManagement';
import { PlusPriceType, PlusPriceTypeAppsId } from '../../lib/featureValues';
import { getPrice } from '../../lib';
import { useFeature } from '../../components/GrowthBookProvider';
import type {
  OpenCheckoutProps,
  PaymentContextData,
  PaymentContextProviderProps,
  ProductOption,
} from './context';
import { PaymentContext } from './context';
import { usePaddle } from '../../features/payment/hooks/usePaddle';

export const PaddleSubProvider = ({
  children,
}: PaymentContextProviderProps): ReactElement => {
  const router = useRouter();
  const { user, geo, isValidRegion: isPlusAvailable } = useAuthContext();
  const planTypes = useFeature(feature.pricingIds);
  const { isPlus } = usePlusSubscription();
  const { paddle } = usePaddle({
    paddleCallback: (event: PaddleEventData) => {
      switch (event?.name) {
        case CheckoutEventNames.CHECKOUT_COMPLETED:
          router.push(plusSuccessUrl);
          break;
        default:
          break;
      }
    },
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
          durationLabel: 'month',
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
          ...(geo?.region && {
            address: {
              countryCode: geo?.region,
            },
          }),
        },
        customData: {
          user_id: giftToUserId ?? user?.id,
          ...(!!giftToUserId && { gifter_id: user?.id }),
        },
        settings: {
          displayMode: 'inline',
          variant: 'one-page',
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
      geo?.region,
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
