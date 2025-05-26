import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { PlusInfo } from './PlusInfo';
import type { OpenCheckoutFn } from '../../contexts/payment/context';
import { usePaymentContext } from '../../contexts/payment/context';
import { useSlider } from '../../hooks';
import type { CommonPlusPageProps } from './common';
import { useGiftUserContext } from './GiftUserContext';
import { plusUrl } from '../../lib/constants';
import { objectToQueryParams } from '../../lib';
import { plusSlides } from './utils';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';

const PlusTrustRefund = dynamic(() =>
  import('./PlusTrustRefund').then((mod) => mod.PlusTrustRefund),
);

const PlusFAQs = dynamic(() => import('./PlusFAQ').then((mod) => mod.PlusFAQ));
const Slider = dynamic(() => import('../containers/Slider'));
const CarouselIndicator = dynamic(
  () => import('../containers/CarouselIndicator'),
);

export const PlusMobile = ({
  shouldShowPlusHeader,
}: CommonPlusPageProps): ReactElement => {
  const router = useRouter();
  const { giftToUser } = useGiftUserContext();
  const { productOptions } = usePaymentContext();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const { currentIndex, setCurrentIndex, sliderRef } = useSlider(plusSlides);

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
      className="flex flex-col py-6"
      ref={(element) => {
        if (!element) {
          return;
        }

        if (productOptions?.[0]?.priceId && !selectedOption) {
          setSelectedOption(productOptions[0].priceId);
        }
      }}
    >
      <div className="px-6">
        <PlusInfo
          productOptions={productOptions}
          selectedOption={selectedOption}
          onChange={selectionChange}
          onContinue={onContinue}
          shouldShowPlusHeader={shouldShowPlusHeader}
        />
        <PlusTrustRefund className="mt-6" />
      </div>
      <div className="mt-10 flex w-full flex-col gap-8 bg-shadow-shadow3 py-10">
        <div className="flex flex-col items-center gap-6">
          <div className="flex max-w-2xl flex-col items-center gap-2 px-2 text-center">
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
          <Button
            size={ButtonSize.Medium}
            variant={ButtonVariant.Primary}
            onClick={onContinue}
            disabled={!selectedOption}
          >
            Continue with Plus
          </Button>
          <div className="h-[21.875rem] w-full">
            <Slider
              ref={sliderRef}
              slides={plusSlides}
              currentIndex={currentIndex}
              onIndexChange={setCurrentIndex}
              enableSwipe
              className={{
                container: 'h-full',
                slide: 'h-70 w-full px-4',
              }}
              autoPlayInterval={4000}
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
      <div className="px-6">
        <PlusFAQs />
      </div>
    </div>
  );
};
