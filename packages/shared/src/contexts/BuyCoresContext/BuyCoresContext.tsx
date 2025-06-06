import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { isIOSNative } from '../../lib/func';
import { useAuthContext } from '../AuthContext';
import { coresPricesQueryOptions } from '../../graphql/njord';
import { PaddleBuyCoresContextProvider } from './PaddleBuyCoresContext';
import { StoreKitBuyCoresContextProvider } from './StoreKitBuyCoresContext';
import type { BuyCoresContextProviderProps, CoreProductOption } from './types';

export const BuyCoresContextProvider = ({
  children,
  ...props
}: BuyCoresContextProviderProps): ReactElement => {
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
    coresPricesQueryOptions({
      user,
      isLoggedIn,
    }),
  );

  return useMemo(() => {
    const price = prices?.find((item) => item.priceId === pid);

    if (!price) {
      return undefined;
    }

    return {
      id: price.priceId,
      value: price.metadata.coresValue,
    };
  }, [prices, pid]);
};
