import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import { usePaymentContext } from '../../contexts/PaymentContext';

import { PlusInfo } from './PlusInfo';
import { PlusCheckoutContainer } from './PlusCheckoutContainer';
import { MarketingCtaVariant } from '../marketingCta/common';
import { useBoot } from '../../hooks';

const PlusWebapp = (): ReactElement => {
  const { getMarketingCta } = useBoot();
  const marketingCta = getMarketingCta(MarketingCtaVariant.Plus);
  const { flags } = marketingCta;
  const { title, description } = flags;
  const { openCheckout, productOptions } = usePaymentContext();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const checkoutRef = useRef();

  return (
    <div className="flex flex-1 items-start justify-center gap-0">
      <div
        className="flex flex-1 flex-col pl-6 pr-10 pt-8"
        ref={(element) => {
          if (!element) {
            return;
          }

          if (productOptions?.[0]?.value && !selectedOption) {
            setSelectedOption(productOptions?.[0]?.value);
            openCheckout({ priceId: productOptions?.[0]?.value });
          }
        }}
      >
        <PlusInfo
          productOptions={productOptions}
          selectedOption={selectedOption}
          onChange={({ priceId }) => {
            setSelectedOption(priceId);
            openCheckout({ priceId });
          }}
          shouldShowPlusHeader
          showPlusList={false}
          showGiftButton={false}
          showDailyDevLogo
          title={title}
          description={description}
        />
      </div>
      <PlusCheckoutContainer
        checkoutRef={checkoutRef}
        className={{
          container:
            'border-top-0 h-full min-h-40 flex-1 rounded-16 border border-b-0 border-r-0 border-t-0 border-border-subtlest-tertiary bg-raw-pepper-90 pb-5 pl-10 pr-5 pt-8',
          element: 'h-[35rem]',
        }}
      />
    </div>
  );
};

export default PlusWebapp;
