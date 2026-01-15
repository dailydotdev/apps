import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { PurchaseType } from '../../graphql/paddle';
import { usePaddlePayment } from '../../hooks/usePaddlePayment';
import { useLogContext } from '../LogContext';
import { useAuthContext } from '../AuthContext';
import type {
  RecruiterPaymentContextData,
  RecruiterContextProviderProps,
  RecruiterProductOption,
} from './types';
import { RecruiterPaymentContext } from './types';
import { recruiterPricesQueryOptions } from '../../features/opportunity/queries';

export const RecruiterPaymentPaddleContextProvider = ({
  onCompletion,
  origin,
  children,
}: RecruiterContextProviderProps): ReactElement => {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthContext();
  const { logEvent } = useLogContext();
  const [selectedProduct, setSelectedProduct] =
    useState<RecruiterProductOption>();
  const logRef = useRef<typeof logEvent>();
  logRef.current = logEvent;

  const { paddle, openCheckout, appliedDiscountId } = usePaddlePayment({
    successCallback: () => {
      router.replace(`/recruiter/${router.query.opportunityId}/prepare`);
    },
    priceType: PurchaseType.Recruiter,
  });

  const { data: prices } = useQuery(
    recruiterPricesQueryOptions({
      user,
      isLoggedIn,
      discountId: appliedDiscountId ?? undefined,
    }),
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
      onCompletion,
      selectedProduct,
      setSelectedProduct,
      openCheckout,
      origin,
      prices,
    }),
    [onCompletion, openCheckout, origin, paddle, selectedProduct, prices],
  );

  return (
    <RecruiterPaymentContext.Provider value={contextData}>
      {children}
    </RecruiterPaymentContext.Provider>
  );
};
