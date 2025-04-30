import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CoreOptionButton,
  CoreOptionButtonPlaceholder,
} from './CoreOptionButton';
import { useAuthContext } from '../../contexts/AuthContext';
import { transactionPricesQueryOptions } from '../../graphql/njord';
import { promisifyEventListener } from '../../lib/func';
import { stringToBoolean } from '../../lib/utils';
import { useBuyCoresContext } from '../../contexts/BuyCoresContext/types';

export const CoreOptionList = (): ReactElement => {
  const { selectedProduct } = useBuyCoresContext();
  const { user, isLoggedIn } = useAuthContext();
  const [isLoadingNative, setLoadingNative] = useState(false);
  const { data: prices, isPending: isPendingPrices } = useQuery(
    transactionPricesQueryOptions({
      user,
      isLoggedIn,
    }),
  );

  useEffect(() => {
    promisifyEventListener<void, 'true' | 'false'>(
      'iap-loading',
      ({ detail }) => {
        setLoadingNative(stringToBoolean(detail));
      },
      {
        once: false,
      },
    ).catch(() => {
      setLoadingNative(false);
    });

    return () => {
      globalThis?.eventControllers?.['iap-loading']?.abort();
    };
  }, []);

  return (
    <ul className="mt-4 flex flex-col gap-2" role="radiogroup">
      {isPendingPrices &&
        new Array(9).fill(null).map((_, index) => {
          // eslint-disable-next-line react/no-array-index-key
          return <CoreOptionButtonPlaceholder key={index} />;
        })}
      {!isPendingPrices &&
        prices?.map((price) => {
          return (
            <CoreOptionButton
              key={price.value}
              id={price.value}
              label={price.label}
              cores={price.coresValue}
              priceFormatted={price.price.formatted}
              isLoading={isLoadingNative && price.value === selectedProduct?.id}
              // prevent clicks while native iap is loading
              isDisabled={isLoadingNative}
            />
          );
        })}
    </ul>
  );
};
