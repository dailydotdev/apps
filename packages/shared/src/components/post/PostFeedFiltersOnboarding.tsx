import React, { ReactElement, useContext, useEffect } from 'react';
import { Button } from '../buttons/Button';
import { cloudinary } from '../../lib/image';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetType } from '../../lib/analytics';
import { ExperimentWinner } from '../../lib/featureValues';

const imageClassNames = 'absolute right-0';

interface PostFeedFiltersOnboardingProps {
  onInitializeOnboarding: () => void;
}

export function PostFeedFiltersOnboarding({
  onInitializeOnboarding,
}: PostFeedFiltersOnboardingProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  useEffect(() => {
    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.ArticleAnonymousCTA,
      target_id: ExperimentWinner.ArticleOnboarding,
    });
  }, []);

  return (
    <div className="flex relative mt-8 rounded-16 border border-theme-color-cabbage">
      <div className="py-3 px-4 w-3/5">
        <p className="font-bold typo-callout">
          Let&apos;s super-charge your feed with the content you actually read!
        </p>
        <Button
          className="mt-4 text-white btn-primary-cabbage"
          buttonSize="small"
          onClick={onInitializeOnboarding}
        >
          Customize
        </Button>
      </div>
      <img
        src={cloudinary.feedFilters.topicsV3}
        alt="example topics for your feed"
        className={imageClassNames}
      />
    </div>
  );
}
