import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { PurchaseType } from '../../graphql/paddle';
import { usePaddlePayment } from '../../hooks/usePaddlePayment';
import type {
  RecruiterPaymentContextData,
  RecruiterProductOption,
} from './types';
import { RecruiterPaymentContext } from './types';
import { recruiterPricesPublicQueryOptions } from '../../features/opportunity/queries';

interface RecruiterPaymentPublicContextProviderProps {
  children?: ReactNode;
  onPaymentComplete?: () => void;
}

export const RecruiterPaymentPublicContextProvider = ({
  onPaymentComplete,
  children,
}: RecruiterPaymentPublicContextProviderProps): ReactElement => {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] =
    useState<RecruiterProductOption>();

  const { paddle, openCheckout, appliedDiscountId } = usePaddlePayment({
    successCallback: () => {
      onPaymentComplete?.();
    },
    priceType: PurchaseType.Recruiter,
  });

  const { data: prices } = useQuery(
    recruiterPricesPublicQueryOptions(appliedDiscountId ?? undefined),
  );

  const priceIdQuery = router?.query?.pid as string | undefined;

  useEffect(() => {
    if (!prices?.length) {
      return;
    }

    if (selectedProduct) {
      return;
    }

    const matchedProduct =
      prices.find((item) => item.priceId === priceIdQuery) || prices[0];

    setSelectedProduct({
      id: matchedProduct.priceId,
    });
  }, [prices, selectedProduct, priceIdQuery]);

  const contextData = useMemo<RecruiterPaymentContextData>(
    () => ({
      paddle,
      selectedProduct,
      setSelectedProduct,
      openCheckout,
      prices,
    }),
    [openCheckout, paddle, selectedProduct, prices],
  );

  return (
    <RecruiterPaymentContext.Provider value={contextData}>
      {children}
    </RecruiterPaymentContext.Provider>
  );
};
