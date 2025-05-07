import type { ReactElement } from 'react';
import React, { useMemo, useRef, useState } from 'react';
import { getQuantityForPrice } from '../../graphql/njord';
import { ProductPricingType } from '../../graphql/paddle';
import { usePaddlePayment } from '../../hooks/usePaddlePayment';
import { useProductPricing } from '../../hooks/useProductPricing';
import { TargetType } from '../../lib/log';
import { useLogContext } from '../LogContext';
import { BuyCoresContext, SCREENS } from './types';
import type {
  BuyCoresContextProviderProps,
  ProcessingError,
  BuyCoresContextData,
  Screens,
} from './types';

export const PaddleBuyCoresContextProvider = ({
  onCompletion,
  origin,
  amountNeeded,
  children,
}: BuyCoresContextProviderProps): ReactElement => {
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

  const { data: prices } = useProductPricing({
    type: ProductPricingType.Cores,
  });

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
    targetType: TargetType.Credits,
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
