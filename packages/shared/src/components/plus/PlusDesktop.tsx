import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import type { OpenCheckoutFn } from '../../contexts/payment/context';
import { usePaymentContext } from '../../contexts/payment/context';
import { PlusInfo } from './PlusInfo';
import { PlusCheckoutContainer } from './PlusCheckoutContainer';
import { useGiftUserContext } from './GiftUserContext';
import type { CommonPlusPageProps } from './common';
import { PlusTrustRefund } from './PlusTrustRefund';
import { usePlusSubscription } from '../../hooks';

const PlusFAQs = dynamic(() => import('./PlusFAQ').then((mod) => mod.PlusFAQ));

export const PlusDesktop = ({
  shouldShowPlusHeader,
}: CommonPlusPageProps): ReactElement => {
  const {
    openCheckout,
    paddle,
    productOptions,
    giftOneYear,
    isFreeTrialExperiment,
    isPricesPending,
  } = usePaymentContext();
  const { giftToUser } = useGiftUserContext();
  const {
    query: { selectedPlan },
  } = useRouter();
  const { isPlus } = usePlusSubscription();
  const initialPaymentOption = selectedPlan ? `${selectedPlan}` : null;
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const ref = useRef();

  const onChangeCheckoutOption: OpenCheckoutFn = useCallback(
    ({ priceId, giftToUserId }) => {
      setSelectedOption(priceId);
      openCheckout({ priceId, giftToUserId });
    },
    [openCheckout],
  );

  useEffect(() => {
    if (!ref?.current || !paddle || selectedOption) {
      return;
    }

    if (giftToUser) {
      if (!giftOneYear) {
        return;
      }

      const { priceId } = giftOneYear;
      setSelectedOption(priceId);
      openCheckout({ priceId, giftToUserId: giftToUser.id });

      return;
    }

    const option = initialPaymentOption || productOptions?.[0]?.priceId;

    if (option && !isPlus) {
      setSelectedOption(option);
      openCheckout({ priceId: option });
    }
  }, [
    giftOneYear,
    giftToUser,
    initialPaymentOption,
    openCheckout,
    paddle,
    isPlus,
    productOptions,
    selectedOption,
  ]);

  return (
    <>
      <div className="flex flex-1 items-center justify-center gap-20 pt-10">
        <div className="flex w-[28.5rem] flex-col">
          <PlusInfo
            productOptions={productOptions}
            selectedOption={selectedOption}
            onChange={onChangeCheckoutOption}
            shouldShowPlusHeader={shouldShowPlusHeader}
          />
        </div>
        <div className="flex flex-col gap-4">
          <PlusCheckoutContainer
            checkoutRef={ref}
            className={{
              container:
                'min-h-40 w-[28.5rem] rounded-16 border border-border-subtlest-tertiary bg-background-default p-5 empty:min-h-[50vh] empty:bg-surface-float',
              element: 'h-[35rem]',
            }}
          />
          {!isFreeTrialExperiment && !isPricesPending && !giftToUser && (
            <div className="flex justify-center">
              <PlusTrustRefund />
            </div>
          )}
        </div>
      </div>
      {isFreeTrialExperiment && !isPricesPending && !giftToUser && (
        <div className="mx-auto mt-10 flex w-[62.5rem] gap-3">
          <PlusTrustRefund />
        </div>
      )}
      <PlusFAQs />
    </>
  );
};
