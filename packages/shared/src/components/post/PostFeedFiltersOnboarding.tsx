import React, { ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
import { Button } from '../buttons/Button';
import { cloudinary } from '../../lib/image';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetType } from '../../lib/analytics';
import { ExperimentWinner } from '../../lib/featureValues';

const imageClassNames = 'absolute right-0';

interface PostFeedFiltersOnboardingProps {
  onInitializeOnboarding: () => void;
  className?: string;
}

export function PostFeedFiltersOnboarding({
  onInitializeOnboarding,
  className,
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
    <div
      className={classNames(
        'flex relative rounded-16 border border-theme-color-cabbage',
        className,
      )}
    >
      <div className="w-3/5 py-3 px-4">
        <p className="font-bold typo-callout">
          Let&apos;s super-charge your feed with the content you actually read!
        </p>
        <Button
          className="btn-primary-cabbage mt-4 text-white"
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
