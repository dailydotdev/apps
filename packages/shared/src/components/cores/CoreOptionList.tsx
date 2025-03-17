import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CoreOptionButton,
  CoreOptionButtonPlaceholder,
} from './CoreOptionButton';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { getCorePricePreviews } from '../../graphql/paddle';
import { useAuthContext } from '../../contexts/AuthContext';
import { useBuyCoresContext } from '../../contexts/BuyCoresContext';

export const CoreOptionList = (): ReactElement => {
  const { amountNeeded, selectedProduct, setSelectedProduct, openCheckout } =
    useBuyCoresContext();
  const { user, isLoggedIn } = useAuthContext();
  const { data: prices, isPending: isPendingPrices } = useQuery({
    queryKey: generateQueryKey(RequestKey.PricePreview, user, 'cores'),
    queryFn: getCorePricePreviews,
    enabled: isLoggedIn,
    staleTime: StaleTime.Default,
  });

  useEffect(() => {
    if (!prices) {
      return;
    }

    if (selectedProduct) {
      return;
    }

    // find first price that is greater than or equal to the amount needed
    // and select that product option
    const selectedPrice = prices.find(
      (price) => price.coresValue >= amountNeeded,
    );

    if (selectedPrice) {
      setSelectedProduct({
        id: selectedPrice.value,
        value: selectedPrice.coresValue,
      });

      openCheckout({
        priceId: selectedPrice.value,
      });
    }
  }, [prices, amountNeeded, selectedProduct, setSelectedProduct, openCheckout]);

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
