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

import { PurchaseType } from '../../graphql/paddle';
import { PlusProductToggle } from './PlusProductToggle';

const PlusFAQs = dynamic(() => import('./PlusFAQ').then((mod) => mod.PlusFAQ));

export const PlusDesktop = ({
  shouldShowPlusHeader,
}: CommonPlusPageProps): ReactElement => {
  const {
    openCheckout,
    isPaddleReady,
    productOptions,
    giftOneYear,
    isPricesPending,
    isOrganization,
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
    ({ priceId, giftToUserId, quantity }) => {
      setSelectedOption(priceId);
      openCheckout({ priceId, giftToUserId, quantity });
    },
    [openCheckout],
  );

  useEffect(() => {
    if (!ref?.current || !isPaddleReady || selectedOption) {
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

    // Auto-select if user is not plus or it is organization checkout
    if (option && (!isPlus || isOrganization)) {
      setSelectedOption(option);
      openCheckout({ priceId: option });
    }
  }, [
    giftOneYear,
    giftToUser,
    initialPaymentOption,
    openCheckout,
    isPaddleReady,
    isPlus,
    productOptions,
    selectedOption,
    isOrganization,
  ]);

  return (
    <>
      <div className="flex flex-1 justify-center gap-20 pt-10">
        <div className="flex w-[28.5rem] flex-col">
          {!giftToUser && (
            <PlusProductToggle
              options={[
                { priceType: PurchaseType.Plus, label: 'Personal' },
                {
                  priceType: PurchaseType.Organization,
                  label: 'Team',
                },
              ]}
              onSelect={() => setSelectedOption(null)}
              className="self-start"
            />
          )}
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
          {!isPricesPending && !giftToUser && (
            <div className="flex justify-center">
              <PlusTrustRefund />
            </div>
          )}
        </div>
      </div>
      <PlusFAQs />
    </>
  );
};
