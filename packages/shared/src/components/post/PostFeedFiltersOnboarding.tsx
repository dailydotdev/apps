import React, { ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
import { cloudinary } from '../../lib/image';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetType } from '../../lib/analytics';
import { ExperimentWinner } from '../../lib/featureValues';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';

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
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={classNames(
        'relative flex items-center rounded-16 border border-theme-color-cabbage',
        className,
      )}
      onClick={onInitializeOnboarding}
      role="button"
      tabIndex={0}
      aria-label="Customize your feed"
      onKeyDown={(event) => {
        if (event.key !== 'Enter') {
          return;
        }

        onInitializeOnboarding();
      }}
    >
      <div className="w-3/5 px-4 py-3">
        <p className="font-bold typo-callout">
          Let&apos;s super-charge your feed with the content you actually read!
        </p>
        <Button
          className="mt-4"
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          size={ButtonSize.Small}
          tabIndex={-1}
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
