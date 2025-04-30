import type { ReactElement, ReactNode } from 'react';
import React, { useContext, useMemo, useRef, useState } from 'react';
import { CheckoutEventNames, type Paddle } from '@paddle/paddle-js';
import { useRouter } from 'next/router';
import type { OpenCheckoutFn } from './payment/context';
import type { Origin } from '../lib/log';
import { TargetType } from '../lib/log';
import { getQuantityForPrice } from '../graphql/njord';
import { useLogContext } from './LogContext';
import { useProductPricing } from '../hooks/useProductPricing';
import { ProductPricingType } from '../graphql/paddle';
import { usePaddlePayment } from '../hooks/usePaddlePayment';

const SCREENS = {
  INTRO: 'INTRO',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
} as const;
export type Screens = keyof typeof SCREENS;

type CoreProductOption = {
  id: string;
  value: number;
};

export type ProcessingError = {
  title: string;
  description?: string;
  onRequestClose?: () => void;
};

export type BuyCoresContextData = {
  paddle?: Paddle | undefined;
  openCheckout?: OpenCheckoutFn;
  amountNeeded?: number;
  onCompletion?: () => void;
  selectedProduct?: CoreProductOption;
  setSelectedProduct: (product: CoreProductOption) => void;
  activeStep: Screens;
  error?: ProcessingError;
  setActiveStep: ({
    step,
    providerTransactionId,
    error,
  }: {
    step: Screens;
    providerTransactionId?: string;
    error?: ProcessingError;
  }) => void;
  providerTransactionId?: string;
  origin?: Origin;
};

const BuyCoresContext = React.createContext<BuyCoresContextData>(undefined);
export default BuyCoresContext;

export type BuyCoresContextProviderProps = {
  children?: ReactNode;
  origin: Origin;
  amountNeeded?: number;
  onCompletion?: () => void;
};

export const BuyCoresContextProvider = ({
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

export const useBuyCoresContext = (): BuyCoresContextData =>
  useContext(BuyCoresContext);

export const useCoreProductOptionQuery = (): CoreProductOption => {
  const router = useRouter();
  const pid = router?.query?.pid;
  const { data: prices } = useProductPricing({
    type: ProductPricingType.Cores,
  });

  return useMemo(() => {
    const price = prices?.find(({ priceId }) => priceId === pid);

    if (!price) {
      return undefined;
    }

    return {
      id: price.priceId,
      value: price.metadata.coresValue,
    };
  }, [prices, pid]);
};
