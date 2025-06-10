import type { ReactElement } from 'react';
import React, { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getQuantityForPrice,
  coresPricesQueryOptions,
} from '../../graphql/njord';
import { PurchaseType } from '../../graphql/paddle';
import { usePaddlePayment } from '../../hooks/usePaddlePayment';
import { useLogContext } from '../LogContext';
import { BuyCoresContext, SCREENS } from './types';
import type {
  BuyCoresContextProviderProps,
  ProcessingError,
  BuyCoresContextData,
  Screens,
} from './types';
import { useAuthContext } from '../AuthContext';

export const PaddleBuyCoresContextProvider = ({
  onCompletion,
  origin,
  amountNeeded,
  children,
}: BuyCoresContextProviderProps): ReactElement => {
  const { user, isLoggedIn } = useAuthContext();
  const { logEvent } = useLogContext();
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
  const logRef = useRef<typeof logEvent>();
  logRef.current = logEvent;

  const { data: prices } = useQuery(
    coresPricesQueryOptions({
      user,
      isLoggedIn,
    }),
  );

  const getQuantityForPriceFn = ({ priceId }: { priceId: string }) => {
    return getQuantityForPrice({ priceId, prices });
  };
  const getQuantityForPriceRef = useRef(getQuantityForPriceFn);
  getQuantityForPriceRef.current = getQuantityForPriceFn;

  const { paddle, openCheckout } = usePaddlePayment({
    successCallback: (event) => {
      setActiveStep({
        step: SCREENS.PROCESSING,
        providerTransactionId: event.data.transaction_id,
      });
    },
    getProductQuantity: (event) =>
      getQuantityForPriceRef.current({
        priceId: event.data.items[0]?.price_id,
      }),
    priceType: PurchaseType.Cores,
  });

  const contextData = useMemo<BuyCoresContextData>(
    () => ({
      paddle,
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
      paddle,
      selectedProduct,
    ],
  );

  return (
    <BuyCoresContext.Provider value={contextData}>
      {children}
    </BuyCoresContext.Provider>
  );
};
