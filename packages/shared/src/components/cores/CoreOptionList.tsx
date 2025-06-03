import type { ReactElement } from 'react';
import React from 'react';
import {
  CoreOptionButton,
  CoreOptionButtonPlaceholder,
} from './CoreOptionButton';
import { useProductPricing } from '../../hooks/useProductPricing';
import { PurchaseType } from '../../graphql/paddle';

export const CoreOptionList = (): ReactElement => {
  const { data: prices, isPending: isPendingPrices } = useProductPricing({
    type: PurchaseType.Cores,
  });

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
              key={price.priceId}
              id={price.priceId}
              label={price.metadata.title}
              cores={price.metadata.coresValue}
              priceFormatted={price.price.formatted}
            />
          );
        })}
    </ul>
  );
};
