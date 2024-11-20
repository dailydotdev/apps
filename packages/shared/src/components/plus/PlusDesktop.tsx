import React, {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { usePaymentContext } from '../../contexts/PaymentContext';

import { PlusInfo } from './PlusInfo';

export const PlusDesktop = (): ReactElement => {
  const { openCheckout, paddle, productOptions } = usePaymentContext();
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

    if (productOptions?.[0]?.value && !selectedOption) {
      setSelectedOption(productOptions?.[0]?.value);
      openCheckout({ priceId: productOptions?.[0]?.value });
    }
  }, [openCheckout, paddle, productOptions, selectedOption]);

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
      />
    </div>
  );
};
