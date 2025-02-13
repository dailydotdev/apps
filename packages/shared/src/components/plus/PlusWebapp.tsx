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
  const ref = useRef();

  return (
    <div className="flex flex-1 items-start justify-center !gap-0">
      <div
        className="ml-6 flex w-[28.5rem] flex-col !pt-8 pr-10"
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
        checkoutRef={ref}
        className={{
          container:
            'border-top-0 h-full min-h-40 w-[28.5rem] rounded-16 border border-b-0 border-r-0 border-t-0 border-border-subtlest-tertiary bg-background-default pb-5 pl-10 pr-5 pt-8 ',
          element: 'h-[35rem]',
        }}
      />
    </div>
  );
};

export default PlusWebapp;
