import React, { ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize } from '../buttons/Button';
import IntegrationIcon from '../icons/Integration';
import { ArticleOnboardingVersion } from '../../lib/featureValues';
import ConditionalWrapper from '../ConditionalWrapper';
import { PostNavigationProps } from './common';
import { cloudinary } from '../../lib/image';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetType } from '../../lib/analytics';

const versionToWrapperClassName = (
  hasNavigation,
): Record<ArticleOnboardingVersion, string> => {
  return {
    [ArticleOnboardingVersion.V1]: classNames(
      ' flex-row items-center px-4 w-full h-12 bg-gradient-to-r  from-theme-gradient-cabbage to-theme-gradient-onion',
      hasNavigation ? 'rounded-t-16' : 'rounded-br-16',
    ),
    [ArticleOnboardingVersion.V2]:
      'bg-theme-overlay-float-cabbage -mx-8 h-[12.5rem] items-center',
    [ArticleOnboardingVersion.V3]:
      'border-theme-color-cabbage rounded-16 border  mt-8 relative',
  };
};

const versionToButtonClassName: Record<ArticleOnboardingVersion, string> = {
  [ArticleOnboardingVersion.V1]: 'ml-4 btn-secondary',
  [ArticleOnboardingVersion.V2]: 'btn-primary-cabbage text-white mt-4 mb-2',
  [ArticleOnboardingVersion.V3]: 'btn-primary-cabbage text-white mt-4',
};
const versionToButtonSize: Record<ArticleOnboardingVersion, ButtonSize> = {
  [ArticleOnboardingVersion.V1]: 'xsmall',
  [ArticleOnboardingVersion.V2]: 'small',
  [ArticleOnboardingVersion.V3]: 'small',
};
const versionToButtonText: Record<ArticleOnboardingVersion, string> = {
  [ArticleOnboardingVersion.V1]: 'Start now',
  [ArticleOnboardingVersion.V2]: 'Customize',
  [ArticleOnboardingVersion.V3]: 'Customize',
};
const versionToConditionalWrapperClassName: Record<
  ArticleOnboardingVersion,
  string
> = {
  [ArticleOnboardingVersion.V1]: '',
  [ArticleOnboardingVersion.V2]: 'py-4 px-8',
  [ArticleOnboardingVersion.V3]: 'py-3 px-4',
};
const imageClassNames = 'absolute right-0';

interface PostFeedFiltersOnboardingProps
  extends Pick<PostNavigationProps, 'postPreviousNext'> {
  hasNavigation: boolean;
  version: ArticleOnboardingVersion;
  onInitializeOnboarding: () => void;
}

export function PostFeedFiltersOnboarding({
  hasNavigation,
  version,
  postPreviousNext,
  onInitializeOnboarding,
}: PostFeedFiltersOnboardingProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  useEffect(() => {
    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.ArticleAnonymousCTA,
      target_id: version,
    });
  }, []);

  return (
    <>
      <div
        className={classNames(
          'flex',
          versionToWrapperClassName(hasNavigation)[version],
        )}
      >
        {version === ArticleOnboardingVersion.V1 && (
          <IntegrationIcon size="medium" secondary className="mr-2" />
        )}
        <ConditionalWrapper
          condition={version !== ArticleOnboardingVersion.V1}
          wrapper={(children) => (
            <div
              className={classNames(
                'w-3/5',
                versionToConditionalWrapperClassName[version],
              )}
            >
              {children}
            </div>
          )}
        >
          <>
            {version === ArticleOnboardingVersion.V2 && (
              <div
                role="navigation"
                className={hasNavigation && 'flex gap-2 mb-6 pt-2'}
              >
                {postPreviousNext}
              </div>
            )}
            <p className="font-bold typo-callout">
              Let&apos;s super-charge your feed with the content you actually
              read!
            </p>
            <Button
              className={versionToButtonClassName[version]}
              buttonSize={versionToButtonSize[version]}
              onClick={onInitializeOnboarding}
            >
              {versionToButtonText[version]}
            </Button>
          </>
        </ConditionalWrapper>
        {version === ArticleOnboardingVersion.V2 && (
          <img
            src={cloudinary.feedFilters.topicsV2}
            alt="example topics for your feed"
            className={imageClassNames}
          />
        )}
        {version === ArticleOnboardingVersion.V3 && (
          <img
            src={cloudinary.feedFilters.topicsV3}
            alt="example topics for your feed"
            className={imageClassNames}
          />
        )}
      </div>
      {version === ArticleOnboardingVersion.V3 && hasNavigation && (
        <div
          role="navigation"
          className="flex relative flex-row gap-2 items-center pt-6"
        >
          {postPreviousNext}
        </div>
      )}
    </>
  );
}
