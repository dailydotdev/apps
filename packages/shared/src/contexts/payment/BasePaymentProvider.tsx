import type { PropsWithChildren, ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../AuthContext';
import type { OpenCheckoutProps, PaymentContextData } from './context';
import { PaymentContext } from './context';
import type {
  ProductPricingPreview,
  ProductPricingType,
} from '../../graphql/paddle';
import { fetchPricingPreview } from '../../graphql/paddle';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { PlusPriceTypeAppsId } from '../../lib/featureValues';

export type BasePaymentProviderComponentProps = PropsWithChildren<
  Pick<BasePaymentProviderProps, 'type'>
>;

interface BasePaymentProviderProps {
  type: ProductPricingType;
  openCheckout: (props: OpenCheckoutProps) => void;
  additionalContext?: Partial<PaymentContextData>;
}

export const BasePaymentProvider = ({
  type,
  children,
  openCheckout,
  additionalContext = {},
}: PropsWithChildren<BasePaymentProviderProps>): ReactElement => {
  const { user, isValidRegion: isPlusAvailable } = useAuthContext();
  const { data, isPending: isPricesPending } = useQuery<
    ProductPricingPreview[]
  >({
    queryKey: generateQueryKey(RequestKey.PricePreview, user, 'plus'),
    queryFn: () => fetchPricingPreview(type),
    enabled: !!user && isPlusAvailable,
    staleTime: StaleTime.Default,
  });

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
        data?.filter(({ priceId }) => priceId !== giftOneYear?.priceId) ?? [],
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
