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
import { PurchaseType } from '../../graphql/paddle';
import { useFeature } from '../GrowthBookProvider';
import { featurePlusApiLanding } from '../../lib/featureManagement';

const PlusTrustRefund = dynamic(() =>
  import('./PlusTrustRefund').then((mod) => mod.PlusTrustRefund),
);

const PlusFAQs = dynamic(() => import('./PlusFAQ').then((mod) => mod.PlusFAQ));
const PlusApiShowcase = dynamic(() =>
  import('./PlusApiShowcase').then((mod) => mod.PlusApiShowcase),
);

export const PlusMobile = ({
  shouldShowPlusHeader,
}: CommonPlusPageProps): ReactElement => {
  const router = useRouter();
  const { giftToUser } = useGiftUserContext();
  const { productOptions, isOrganization } = usePaymentContext();
  const apiLandingVariant = useFeature(featurePlusApiLanding);
  const isApiVariant = apiLandingVariant === 'api';
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const selectionChange: OpenCheckoutFn = useCallback(({ priceId }) => {
    setSelectedOption(priceId);
  }, []);

  const onContinue = useCallback(() => {
    const query: Record<string, string> = {};
    if (selectedOption) {
      query.pid = selectedOption;
    }
    if (giftToUser?.id) {
      query.gift = giftToUser.id;
    }
    const params = objectToQueryParams(query);

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
        productOptions={productOptions ?? []}
        selectedOption={selectedOption}
        onChange={selectionChange}
        onContinue={onContinue}
        shouldShowPlusHeader={shouldShowPlusHeader}
      />
      <PlusTrustRefund className="mt-6" />
      {isApiVariant && !isOrganization && !giftToUser && <PlusApiShowcase />}
      <PlusFAQs />
    </div>
  );
};
