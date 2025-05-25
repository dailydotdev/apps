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
import Slider from '../containers/Slider';
import { VideoSlide } from '../containers/VideoSlide';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

const PlusFAQs = dynamic(() => import('./PlusFAQ').then((mod) => mod.PlusFAQ));

const slides = [
  <div key={0} className="flex h-full flex-col p-4">
    <div className="flex min-h-0 flex-1 items-center justify-center">
      <VideoSlide
        src="https://media.daily.dev/video/upload/v1741698572/videos/customfeeds.webm"
        className="pointer-events-none h-full w-full object-contain"
      />
    </div>
    <div className="mx-auto mt-4 max-w-sm flex-shrink-0 text-center">
      <h3 className="mb-2 text-lg font-semibold">Advanced custom feeds</h3>
      <p className="text-gray-600 text-sm">
        Build the perfect feed for your needs with advanced filtering options,
        custom tags, and personalized recommendations.
      </p>
    </div>
  </div>,
  <div key={1} className="flex h-full flex-col p-4">
    <div className="flex min-h-0 flex-1 items-center justify-center">
      <VideoSlide
        src="https://media.daily.dev/video/upload/v1741698572/videos/shield.webm"
        className="pointer-events-none h-full w-full object-contain"
      />
    </div>
    <div className="mx-auto mt-4 max-w-sm flex-shrink-0 text-center">
      <h3 className="mb-2 text-lg font-semibold">AI-powered clean titles</h3>
      <p className="text-gray-600 text-sm">
        Get clean, readable article titles powered by AI. No more clickbait or
        confusing headlines in your feed.
      </p>
    </div>
  </div>,
  <div key={2} className="flex h-full flex-col p-4">
    <div className="flex min-h-0 flex-1 items-center justify-center">
      <VideoSlide
        src="https://media.daily.dev/video/upload/v1741273644/bookmarks_xybqxe.webm"
        className="pointer-events-none h-full w-full object-contain"
      />
    </div>
    <div className="mx-auto mt-4 max-w-sm flex-shrink-0 text-center">
      <h3 className="mb-2 text-lg font-semibold">Bookmark folders</h3>
      <p className="text-gray-600 text-sm">
        Organize your saved articles with custom folders and tags. Never lose
        track of important content again.
      </p>
    </div>
  </div>,
  <div key={3} className="flex h-full flex-col p-4">
    <div className="flex min-h-0 flex-1 items-center justify-center">
      <img
        className="pointer-events-none h-full w-full object-contain"
        src="https://media.daily.dev/image/upload/s--r2BZKWPk--/f_auto/v1741690961/public/Keyword%20filters"
        alt="Keyword filters"
      />
    </div>
    <div className="mx-auto mt-4 max-w-sm flex-shrink-0 text-center">
      <h3 className="mb-2 text-lg font-semibold">Keyword filters</h3>
      <p className="text-gray-600 text-sm">
        Mute the buzzwords you’re sick of hearing. More signal, less noise.
      </p>
    </div>
  </div>,
  <div key={4} className="flex h-full flex-col p-4">
    <div className="flex min-h-0 flex-1 items-center justify-center">
      <img
        className="pointer-events-none h-full w-full object-contain"
        src="https://media.daily.dev/image/upload/s--jlfaLYq_--/f_auto/v1741690961/public/Ad-free%20experience"
        alt="Ad-free experience"
      />
    </div>
    <div className="mx-auto mt-4 max-w-sm flex-shrink-0 text-center">
      <h3 className="mb-2 text-lg font-semibold">Ad-free experience</h3>
      <p className="text-gray-600 text-sm">
        Enjoy a clean, distraction-free reading experience. No ads, no
        interruptions.
      </p>
    </div>
  </div>,
];

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
  const { currentIndex, setCurrentIndex, sliderRef, goToNext, goToPrevious } =
    useSlider(slides, 2);

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
      <div className="w-full bg-shadow-shadow3 py-16">
        <div className="flex flex-col items-center gap-6">
          <div className="flex max-w-2xl flex-col items-center gap-2 text-center">
            <Typography
              type={TypographyType.LargeTitle}
              bold
              tag={TypographyTag.H2}
            >
              Your unfair advantage
            </Typography>
            <Typography type={TypographyType.Body} tag={TypographyTag.P}>
              These features are built for developers who move fast, think
              sharp, and never fall behind. Staying ahead isn’t optional, it’s
              the baseline.
            </Typography>
          </div>
          <div className="h-[21.875rem] w-full">
            <Slider
              ref={sliderRef}
              slides={slides}
              currentIndex={currentIndex}
              onIndexChange={setCurrentIndex}
              enableSwipe
              className={{
                container: 'h-full',
                slide: 'h-full',
              }}
              // autoPlayInterval={4000}
            />
          </div>
        </div>

        {/* External Controls */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={goToPrevious}
            className="bg-blue-500 rounded hover:bg-blue-600 px-4 py-2 text-white"
          >
            ← Previous
          </button>

          {/* Custom Indicators */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-3 w-3 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-blue-500'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goToNext}
            className="bg-blue-500 rounded hover:bg-blue-600 px-4 py-2 text-white"
          >
            Next →
          </button>
        </div>
      </div>
      <PlusFAQs />
    </>
  );
};
