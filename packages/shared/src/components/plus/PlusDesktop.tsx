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
import { usePlusSubscription, useSlider } from '../../hooks';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { plusSlides } from './utils';

const PlusFAQs = dynamic(() => import('./PlusFAQ').then((mod) => mod.PlusFAQ));
const Slider = dynamic(() => import('../containers/Slider'));
const CarouselIndicator = dynamic(
  () => import('../containers/CarouselIndicator'),
);

export const PlusDesktop = ({
  shouldShowPlusHeader,
}: CommonPlusPageProps): ReactElement => {
  const {
    openCheckout,
    isPaddleReady,
    productOptions,
    giftOneYear,
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
  const { currentIndex, setCurrentIndex, sliderRef } = useSlider(plusSlides, 2);

  const onChangeCheckoutOption: OpenCheckoutFn = useCallback(
    ({ priceId, giftToUserId }) => {
      setSelectedOption(priceId);
      openCheckout({ priceId, giftToUserId });
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

    if (option && !isPlus) {
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
          {!isPricesPending && !giftToUser && (
            <div className="flex justify-center">
              <PlusTrustRefund />
            </div>
          )}
        </div>
      </div>
      <div className="mt-10 flex w-full flex-col gap-8 bg-shadow-shadow3 py-16">
        <div className="flex flex-col items-center gap-6">
          <div className="flex max-w-2xl flex-col items-center gap-2 text-center">
            <Typography
              type={TypographyType.LargeTitle}
              bold
              tag={TypographyTag.H2}
            >
              Your unfair advantage
            </Typography>
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Secondary}
              tag={TypographyTag.P}
            >
              These features are built for developers who move fast, think
              sharp, and never fall behind. Staying ahead isn&apos;t optional,
              it&apos;s the baseline.
            </Typography>
          </div>
          <div className="h-[21.875rem] w-full">
            <Slider
              ref={sliderRef}
              slides={plusSlides}
              currentIndex={currentIndex}
              onIndexChange={setCurrentIndex}
              enableSwipe
              className={{
                container: 'h-full',
                slide: 'h-full w-80 px-4',
              }}
              // autoPlayInterval={4000}
            />
          </div>
        </div>
        <CarouselIndicator
          className={{
            container: 'mx-auto',
            item: '!size-2',
          }}
          active={currentIndex}
          max={plusSlides.length}
          onItemClick={setCurrentIndex}
        />
      </div>
      <PlusFAQs />
    </>
  );
};
