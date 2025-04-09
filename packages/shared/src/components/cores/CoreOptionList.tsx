import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CoreOptionButton,
  CoreOptionButtonPlaceholder,
} from './CoreOptionButton';
import { useAuthContext } from '../../contexts/AuthContext';
import { transactionPricesQueryOptions } from '../../graphql/njord';

export const CoreOptionList = (): ReactElement => {
  const { user, isLoggedIn } = useAuthContext();
  const { data: prices, isPending: isPendingPrices } = useQuery(
    transactionPricesQueryOptions({
      user,
      isLoggedIn,
    }),
  );

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
            />
          );
        })}
    </ul>
  );
};
