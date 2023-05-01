import React, { ReactElement, useContext, useEffect } from 'react';
import { Button, ButtonSize } from './buttons/Button';
import { ExperimentWinner } from '../lib/featureValues';
import { cloudinary } from '../lib/image';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../lib/analytics';

interface ScrollFeedFiltersOnboardingProps {
  onInitializeOnboarding: () => void;
}
export default function ScrollFeedFiltersOnboarding({
  onInitializeOnboarding,
}: ScrollFeedFiltersOnboardingProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  useEffect(() => {
    trackEvent({
      event_name: AnalyticsEvent.EligibleScrollBlock,
      target_id: ExperimentWinner.ScrollOnboardingVersion,
    });
  }, []);

  return (
    <div
      onClick={onInitializeOnboarding}
      role="button"
      tabIndex={0}
      aria-label="Start"
      className="flex relative flex-1 justify-center items-center m-10 h-80"
      onKeyDown={(event) => {
        if (event.key !== 'Enter') {
          return;
        }

        onInitializeOnboarding();
      }}
      style={{
        background:
          'linear-gradient(180deg, #04131e00 0%, #04131eb3 20%, #0e1217 100%)',
      }}
    >
      <div className="flex flex-col items-center">
        <h2 className="mb-6 font-bold typo-title2">
          Supercharge your feed with
          <br /> content you&apos;ll love reading!
        </h2>
        <Button
          className="w-40 btn-primary-cabbage"
          buttonSize={ButtonSize.Large}
          tabIndex={-1}
        >
          Start
        </Button>
      </div>
      <img
        src={cloudinary.feedFilters.scroll}
        alt="example topics for your feed"
        className="laptop:hidden laptopL:block ml-2"
      />
    </div>
  );
}
