import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { usePaymentContext } from '../../contexts/PaymentContext';

import { PlusInfo } from './PlusInfo';
import { PlusUnavailable } from './PlusUnavailable';

export const PlusDesktop = (): ReactElement => {
  const { openCheckout, paddle, productOptions, isPlusAvailable } =
    usePaymentContext();
  const {
    query: { selectedPlan },
  } = useRouter();
  const initialPaymentOption = selectedPlan ? `${selectedPlan}` : null;
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const ref = useRef();

  const toggleCheckoutOption = useCallback(
    (priceId) => {
      setSelectedOption(priceId);
      openCheckout({ priceId });
    },
    [openCheckout],
  );

  useEffect(() => {
    if (!ref?.current || !paddle) {
      return;
    }

    const option = initialPaymentOption || productOptions?.[0]?.value;
    if (option && !selectedOption) {
      setSelectedOption(option);
      openCheckout({ priceId: option });
    }
  }, [
    initialPaymentOption,
    openCheckout,
    paddle,
    productOptions,
    selectedOption,
  ]);

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
        ref={ref}
        className="checkout-container min-h-40 w-[28.5rem] rounded-16 border border-border-subtlest-tertiary bg-background-default p-5"
      >
        {!isPlusAvailable && <PlusUnavailable className="h-[35rem]" />}
      </div>
    </div>
  );
};
