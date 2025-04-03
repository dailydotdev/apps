import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { usePaymentContext } from '../../contexts/payment/context';
import { PlusInfo } from './PlusInfo';
import { PlusCheckoutContainer } from './PlusCheckoutContainer';
import { MarketingCtaVariant } from '../marketingCta/common';
import { useBoot } from '../../hooks';
import { ButtonVariant, Button } from '../buttons/Button';
import PlusListModalSection from './PlusListModalSection';

const PlusWebapp = (): ReactElement => {
  const { getMarketingCta } = useBoot();
  const marketingCta = getMarketingCta(MarketingCtaVariant.Plus);
  const { flags } = marketingCta || {};
  const { openCheckout, productOptions, isPricesPending } = usePaymentContext();
  const [selectedOption, setSelectedOption] = useState<string | null>();
  const checkoutRef = useRef();
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (!isPricesPending && !selectedOption) {
      setSelectedOption(productOptions?.[0]?.productId);
    }
  }, [isPricesPending, productOptions, selectedOption]);

  return (
    <div className="flex flex-1 items-start justify-center gap-0">
      <div className="flex flex-1 flex-col pl-6 pr-10 pt-8">
        <PlusInfo
          productOptions={productOptions}
          selectedOption={selectedOption}
          onChange={({ priceId }) => {
            setSelectedOption(priceId);
          }}
          shouldShowPlusHeader
          showPlusList={false}
          showGiftButton={false}
          showDailyDevLogo
          title={flags?.title}
          description={flags?.description}
          showTrustReviews={false}
        />
        {!showCheckout && (
          <Button
            onClick={() => setShowCheckout(true)}
            variant={ButtonVariant.Primary}
            className="mt-8"
          >
            {flags?.ctaText}
          </Button>
        )}
      </div>
      {showCheckout ? (
        <div
          className="h-full flex-1 pr-6"
          ref={(element) => {
            if (!element) {
              return;
            }
            openCheckout({ priceId: selectedOption });
          }}
        >
          <PlusCheckoutContainer
            checkoutRef={checkoutRef}
            className={{
              container:
                'border-top-0 h-full min-h-40 flex-1 rounded-16 border border-b-0 border-r-0 border-t-0 border-border-subtlest-tertiary bg-raw-pepper-90 pb-5 pl-10 pt-8',
            }}
          />
        </div>
      ) : (
        <PlusListModalSection />
      )}
    </div>
  );
};

export default PlusWebapp;
