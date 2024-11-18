import React, { ReactElement, useCallback, useState } from 'react';
import { usePaymentContext } from '../../contexts/PaymentContext';

import { PlusInfo } from './PlusInfo';

export const PlusDesktop = (): ReactElement => {
  const { openCheckout, productOptions } = usePaymentContext();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const toggleCheckoutOption = useCallback(
    (priceId) => {
      setSelectedOption(priceId);
      openCheckout({ priceId });
    },
    [openCheckout],
  );

  return (
    <div className="flex flex-1 items-center justify-center gap-20">
      <div className="ml-6 flex w-[28.5rem] flex-col">
        <PlusInfo
          productOptions={productOptions}
          selectedOption={selectedOption}
          onChange={toggleCheckoutOption}
        />
      </div>
      <div
        ref={(element) => {
          if (!element) {
            return;
          }

          if (productOptions?.[0]?.value && !selectedOption) {
            setSelectedOption(productOptions?.[0]?.value);
            openCheckout({ priceId: productOptions?.[0]?.value });
          }
        }}
        className="checkout-container min-h-40 w-[28.5rem] rounded-16 border border-border-subtlest-tertiary bg-background-default p-5"
      />
    </div>
  );
};
