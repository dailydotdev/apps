import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../AuthContext';
import { transactionPricesQueryOptions } from '../../graphql/njord';
import type {
  BuyCoresContextData,
  BuyCoresContextProviderProps,
  CoreProductOption,
  ProcessingError,
  Screens,
} from './types';
import { BuyCoresContext, SCREENS } from './types';
import { useStoreKitPayment } from '../../hooks/payment/useStoreKitPayment';
import { PurchaseType } from '../../graphql/paddle';

export const StoreKitBuyCoresContextProvider = ({
  onCompletion,
  origin,
  amountNeeded,
  children,
}: BuyCoresContextProviderProps): ReactElement => {
  const { user, isLoggedIn } = useAuthContext();
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

  const { data: prices } = useQuery(
    transactionPricesQueryOptions({
      user,
      isLoggedIn,
    }),
  );

  const { openCheckout } = useStoreKitPayment({
    products: prices,
    type: PurchaseType.Cores,
    successCallback: (event) => {
      setActiveStep({
        step: SCREENS.PROCESSING,
        providerTransactionId: event.detail.transactionId,
      });
    },
  });

  const contextData = useMemo<BuyCoresContextData>(
    () => ({
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
      selectedProduct,
    ],
  );

  return (
    <BuyCoresContext.Provider value={contextData}>
      {children}
    </BuyCoresContext.Provider>
  );
};

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
