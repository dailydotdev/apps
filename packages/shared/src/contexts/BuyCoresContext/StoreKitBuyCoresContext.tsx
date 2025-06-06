import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../AuthContext';
import { coresPricesQueryOptions } from '../../graphql/njord';
import type {
  BuyCoresContextData,
  BuyCoresContextProviderProps,
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
    coresPricesQueryOptions({
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
