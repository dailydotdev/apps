import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { PlusInfo } from './PlusInfo';
import { usePaymentContext } from '../../contexts/PaymentContext';
import { webappUrl } from '../../lib/constants';
import type { CommonPlusPageProps } from './common';

export const PlusMobile = ({
  shouldShowPlusHeader,
}: CommonPlusPageProps): ReactElement => {
  const router = useRouter();
  const { productOptions } = usePaymentContext();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const selectionChange = useCallback((priceId) => {
    setSelectedOption(priceId);
  }, []);

  const onContinue = useCallback(() => {
    router.push(`${webappUrl}plus/payment?pid=${selectedOption}`);
  }, [router, selectedOption]);

  return (
    <div
      className="flex flex-col p-6"
      ref={(element) => {
        if (!element) {
          return;
        }

        if (productOptions?.[0]?.value && !selectedOption) {
          setSelectedOption(productOptions?.[0]?.value);
        }
      }}
    >
      <PlusInfo
        productOptions={productOptions}
        selectedOption={selectedOption}
        onChange={selectionChange}
        onContinue={onContinue}
        shouldShowPlusHeader={shouldShowPlusHeader}
      />
    </div>
  );
};
