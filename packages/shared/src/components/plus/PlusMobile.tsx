import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { PlusInfo } from './PlusInfo';
import type { OpenCheckoutFn } from '../../contexts/PaymentContext';
import { usePaymentContext } from '../../contexts/PaymentContext';
import type { CommonPlusPageProps } from './common';
import { useGiftUserContext } from './GiftUserContext';
import { webappUrl } from '../../lib/constants';
import { objectToQueryParams } from '../../lib';

export const PlusMobile = ({
  shouldShowPlusHeader,
}: CommonPlusPageProps): ReactElement => {
  const router = useRouter();
  const { giftToUser } = useGiftUserContext();
  const { productOptions } = usePaymentContext();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const selectionChange: OpenCheckoutFn = useCallback(({ priceId }) => {
    setSelectedOption(priceId);
  }, []);

  const onContinue = useCallback(() => {
    const params = objectToQueryParams({
      pid: selectedOption,
      gift: giftToUser?.id,
    });

    router.push(`${webappUrl}plus/payment?${params}`);
  }, [router, giftToUser, selectedOption]);

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
