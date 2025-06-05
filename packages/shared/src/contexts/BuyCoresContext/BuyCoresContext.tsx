import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { isIOSNative } from '../../lib/func';
import { useAuthContext } from '../AuthContext';
import { transactionPricesQueryOptions } from '../../graphql/njord';
import { PaddleBuyCoresContextProvider } from './PaddleBuyCoresContext';
import { StoreKitBuyCoresContextProvider } from './StoreKitBuyCoresContext';
import type { BuyCoresContextProviderProps, CoreProductOption } from './types';
import { priceTypeAtom } from '../payment/context';
import { PurchaseType } from '../../graphql/paddle';

export const BuyCoresContextProvider = ({
  children,
  ...props
}: BuyCoresContextProviderProps): ReactElement => {
  const setPriceType = useSetAtom(priceTypeAtom);
  setPriceType(PurchaseType.Cores);

  if (isIOSNative()) {
    return (
      <StoreKitBuyCoresContextProvider {...props}>
        {children}
      </StoreKitBuyCoresContextProvider>
    );
  }

  return (
    <PaddleBuyCoresContextProvider {...props}>
      {children}
    </PaddleBuyCoresContextProvider>
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
