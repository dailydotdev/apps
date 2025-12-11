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
import { webappUrl } from '../../lib/constants';
import { recruiterPricesQueryOptions } from '../../features/opportunity/graphql';

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

  const { data: prices } = useQuery(
    recruiterPricesQueryOptions({
      user,
      isLoggedIn,
    }),
  );

  useEffect(() => {
    if (!prices?.length) {
      return;
    }

    if (selectedProduct) {
      return;
    }

    setSelectedProduct({
      id: prices[0].priceId,
    });
  }, [prices, selectedProduct]);

  const { paddle, openCheckout } = usePaddlePayment({
    successCallback: () => {
      router.push(
        `${webappUrl}recruiter/${router.query.opportunityId}/prepare`,
      );
    },
    priceType: PurchaseType.Recruiter,
  });

  const contextData = useMemo<RecruiterPaymentContextData>(
    () => ({
      paddle,
      onCompletion,
      selectedProduct,
      setSelectedProduct,
      openCheckout,
      origin,
    }),
    [onCompletion, openCheckout, origin, paddle, selectedProduct],
  );

  return (
    <RecruiterPaymentContext.Provider value={contextData}>
      {children}
    </RecruiterPaymentContext.Provider>
  );
};
