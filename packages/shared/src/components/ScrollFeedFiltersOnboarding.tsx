import React, { ReactElement, useContext, useEffect } from 'react';
import { Button, ButtonSize } from './buttons/Button';
import { ExperimentWinner } from '../lib/featureValues';
import { cloudinary } from '../lib/image';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../lib/analytics';
import SuperchargeIcon from '../../icons/supercharge.svg';

const GaussianBlur = (): ReactElement => {
  return (
    <div className="absolute w-48 h-48 rounded-full blur-2xl opacity-[0.2] bg-theme-color-cabbage" />
  );
};
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
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className="flex relative justify-center items-center mb-10">
          <GaussianBlur />
          <SuperchargeIcon className="w-[4.625rem] h-[4.625rem]" />
        </div>
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
