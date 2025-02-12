import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { usePaymentContext } from '../../contexts/PaymentContext';

import { PlusInfo } from './PlusInfo';
import { PlusCheckoutContainer } from './PlusCheckoutContainer';
import type { CommonPlusPageProps } from './common';
import { MarketingCtaVariant } from '../marketingCta/common';
import { useBoot } from '../../hooks';

type PlusWebappProps = CommonPlusPageProps & {
  className?: string;
  plusInfoContainerClassName?: string;
  checkoutClassName?: {
    container?: string;
    element?: string;
  };
  showPlusList?: boolean;
};

const PlusWebapp = ({
  shouldShowPlusHeader,
  className,
  checkoutClassName,
  plusInfoContainerClassName,
  showPlusList = true,
}: PlusWebappProps): ReactElement => {
  const { getMarketingCta } = useBoot();
  const marketingCta = getMarketingCta(MarketingCtaVariant.Plus);
  const { flags } = marketingCta;
  const { title, description } = flags;
  const { openCheckout, paddle, productOptions } = usePaymentContext();
  const {
    query: { selectedPlan },
  } = useRouter();
  const initialPaymentOption = selectedPlan ? `${selectedPlan}` : null;
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

    const option = initialPaymentOption || productOptions?.[0]?.value;
    if (option && !selectedOption) {
      setSelectedOption(option);
      openCheckout({ priceId: option });
    }
  }, [
    initialPaymentOption,
    openCheckout,
    paddle,
    productOptions,
    selectedOption,
  ]);

  return (
    <div
      className={classNames(
        'flex flex-1 items-center justify-center gap-20',
        className,
      )}
    >
      <div
        className={classNames(
          'ml-6 flex w-[28.5rem] flex-col',
          plusInfoContainerClassName,
        )}
      >
        <PlusInfo
          productOptions={productOptions}
          selectedOption={selectedOption}
          onChange={toggleCheckoutOption}
          shouldShowPlusHeader={shouldShowPlusHeader}
          showPlusList={showPlusList}
          showDailyDevLogo
          title={title}
          description={description}
        />
      </div>
      <PlusCheckoutContainer
        checkoutRef={ref}
        className={{
          container: classNames(
            'min-h-40 w-[28.5rem] rounded-16 border border-border-subtlest-tertiary bg-background-default p-5',
            checkoutClassName?.container,
          ),
          element: classNames('h-[35rem]', checkoutClassName?.element),
        }}
      />
    </div>
  );
};

export default PlusWebapp;
