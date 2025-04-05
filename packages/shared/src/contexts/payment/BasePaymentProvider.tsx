import type { PropsWithChildren, ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../AuthContext';
import type { OpenCheckoutProps, PaymentContextData } from './context';
import { PaymentContext } from './context';
import type { PlusPricingPreview } from '../../graphql/paddle';
import { fetchPlusPricingPreview } from '../../graphql/paddle';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { PlusPriceTypeAppsId } from '../../lib/featureValues';

interface BasePaymentProviderProps {
  openCheckout: (props: OpenCheckoutProps) => void;
  additionalContext?: Partial<PaymentContextData>;
}

export const BasePaymentProvider = ({
  children,
  openCheckout,
  additionalContext = {},
}: PropsWithChildren<BasePaymentProviderProps>): ReactElement => {
  const { user, isValidRegion: isPlusAvailable } = useAuthContext();
  const { data, isPending: isPricesPending } = useQuery<PlusPricingPreview[]>({
    queryKey: generateQueryKey(RequestKey.PricePreview, user, 'plus'),
    queryFn: fetchPlusPricingPreview,
    enabled: !!user && isPlusAvailable,
    staleTime: StaleTime.Default,
  });

  const earlyAdopterPlanId: PaymentContextData['earlyAdopterPlanId'] = useMemo(
    () =>
      data?.find(
        ({ metadata }) => metadata.appsId === PlusPriceTypeAppsId.EarlyAdopter,
      )?.productId,
    [data],
  );

  const giftOneYear = useMemo(
    () =>
      data?.find(
        ({ metadata }) => metadata.appsId === PlusPriceTypeAppsId.GiftOneYear,
      ),
    [data],
  );

  const isFreeTrialExperiment = useMemo(
    () => data?.some(({ trialPeriod }) => !!trialPeriod),
    [data],
  );

  const value = useMemo<PaymentContextData>(
    () => ({
      openCheckout,
      productOptions:
        data?.filter(({ productId }) => productId !== giftOneYear?.productId) ??
        [],
      earlyAdopterPlanId,
      isPlusAvailable,
      giftOneYear,
      isPricesPending,
      isFreeTrialExperiment,
      ...additionalContext,
    }),
    [
      openCheckout,
      data,
      giftOneYear,
      earlyAdopterPlanId,
      isPlusAvailable,
      isPricesPending,
      isFreeTrialExperiment,
      additionalContext,
    ],
  );

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
};
