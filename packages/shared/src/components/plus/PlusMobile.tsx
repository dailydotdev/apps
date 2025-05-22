import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { PlusInfo } from './PlusInfo';
import type { OpenCheckoutFn } from '../../contexts/payment/context';
import { usePaymentContext } from '../../contexts/payment/context';
import type { CommonPlusPageProps } from './common';
import { useGiftUserContext } from './GiftUserContext';
import { plusUrl } from '../../lib/constants';
import { objectToQueryParams } from '../../lib';
import { PlusProductToggle } from './PlusProductToggle';
import { ProductPricingType } from '../../graphql/paddle';

const PlusTrustRefund = dynamic(() =>
  import('./PlusTrustRefund').then((mod) => mod.PlusTrustRefund),
);

const PlusFAQs = dynamic(() => import('./PlusFAQ').then((mod) => mod.PlusFAQ));

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

    router.push(`${plusUrl}/payment?${params}`);
  }, [router, giftToUser, selectedOption]);

  return (
    <div
      className="flex flex-col p-6"
      ref={(element) => {
        if (!element) {
          return;
        }

        if (productOptions?.[0]?.priceId && !selectedOption) {
          setSelectedOption(productOptions[0].priceId);
        }
      }}
    >
      {!giftToUser && (
        <PlusProductToggle
          options={[
            { priceType: ProductPricingType.Plus, label: 'Personal' },
            {
              priceType: ProductPricingType.PlusOrganization,
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
        onChange={selectionChange}
        onContinue={onContinue}
        shouldShowPlusHeader={shouldShowPlusHeader}
      />
      <PlusTrustRefund className="mt-6" />
      <PlusFAQs />
    </div>
  );
};
