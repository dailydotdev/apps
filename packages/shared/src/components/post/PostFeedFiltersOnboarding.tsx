import React, { ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize } from '../buttons/Button';
import IntegrationIcon from '../icons/Integration';
import { MyFeedArticleAnonymousVersion } from '../../lib/featureValues';
import ConditionalWrapper from '../ConditionalWrapper';
import { PostNavigationProps } from './common';
import { cloudinary } from '../../lib/image';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetType } from '../../lib/analytics';

const versionToWrapperClassName = (
  hasNavigation,
): Record<MyFeedArticleAnonymousVersion, string> => {
  return {
    [MyFeedArticleAnonymousVersion.V1]: classNames(
      ' flex-row items-center px-4 w-full h-12 bg-gradient-to-r  from-theme-gradient-cabbage to-theme-gradient-onion',
      hasNavigation ? 'rounded-t-16' : 'rounded-br-16',
    ),
    [MyFeedArticleAnonymousVersion.V2]:
      'bg-theme-overlay-float-cabbage -mx-8 h-[12.5rem] items-center',
    [MyFeedArticleAnonymousVersion.V3]:
      'border-theme-color-cabbage rounded-16 border  mt-8 relative',
  };
};

const versionToButtonClassName: Record<MyFeedArticleAnonymousVersion, string> =
  {
    [MyFeedArticleAnonymousVersion.V1]: 'ml-4 btn-secondary',
    [MyFeedArticleAnonymousVersion.V2]:
      'btn-primary-cabbage text-white mt-4 mb-2',
    [MyFeedArticleAnonymousVersion.V3]: 'btn-primary-cabbage text-white mt-4',
  };
const versionToButtonSize: Record<MyFeedArticleAnonymousVersion, ButtonSize> = {
  [MyFeedArticleAnonymousVersion.V1]: 'xsmall',
  [MyFeedArticleAnonymousVersion.V2]: 'small',
  [MyFeedArticleAnonymousVersion.V3]: 'small',
};
const versionToButtonText: Record<MyFeedArticleAnonymousVersion, string> = {
  [MyFeedArticleAnonymousVersion.V1]: 'Start now',
  [MyFeedArticleAnonymousVersion.V2]: 'Customize',
  [MyFeedArticleAnonymousVersion.V3]: 'Customize',
};
const versionToConditionalWrapperClassName: Record<
  MyFeedArticleAnonymousVersion,
  string
> = {
  [MyFeedArticleAnonymousVersion.V1]: '',
  [MyFeedArticleAnonymousVersion.V2]: 'py-4 px-8',
  [MyFeedArticleAnonymousVersion.V3]: 'py-3 px-4',
};
const imageClassNames = 'absolute right-0';

interface PostFeedFiltersOnboardingProps
  extends Pick<PostNavigationProps, 'postPreviousNext'> {
  hasNavigation: boolean;
  version: MyFeedArticleAnonymousVersion;
  onInitializeOnboarding;
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
        {version === MyFeedArticleAnonymousVersion.V1 && (
          <IntegrationIcon size="medium" secondary className="mr-2" />
        )}
        <ConditionalWrapper
          condition={version !== MyFeedArticleAnonymousVersion.V1}
          wrapper={(children) => (
            <div
              className={classNames(
                'w-1/2',
                versionToConditionalWrapperClassName[version],
              )}
            >
              {children}
            </div>
          )}
        >
          <>
            {version === MyFeedArticleAnonymousVersion.V2 && (
              <div
                role="navigation"
                className={hasNavigation && 'flex gap-2 mb-6'}
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
        {version === MyFeedArticleAnonymousVersion.V2 && (
          <img
            src={cloudinary.feedFilters.topicsV2}
            alt="example topics for your feed"
            className={imageClassNames}
          />
        )}
        {version === MyFeedArticleAnonymousVersion.V3 && (
          <img
            src={cloudinary.feedFilters.topicsV3}
            alt="example topics for your feed"
            className={imageClassNames}
          />
        )}
      </div>
      {version === MyFeedArticleAnonymousVersion.V3 && hasNavigation && (
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
