import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize } from '../buttons/Button';
import IntegrationIcon from '../icons/Integration';
import { PostFeedFiltersOnboardingVersion } from '../../lib/featureValues';
import ConditionalWrapper from '../ConditionalWrapper';
import { PostNavigationProps } from './common';

const versionToWrapperClassName = (
  hasNavigation,
): Record<PostFeedFiltersOnboardingVersion, string> => {
  return {
    [PostFeedFiltersOnboardingVersion.V1]: classNames(
      ' flex-row items-center px-4 w-full h-12 bg-gradient-to-r  from-theme-overlay-cabbage40 to-theme-overlay-onion40',
      hasNavigation ? 'rounded-t-16' : 'rounded-br-16',
    ),
    [PostFeedFiltersOnboardingVersion.V2]: 'bg-theme-overlay-cabbage10 -mx-8 ',
    [PostFeedFiltersOnboardingVersion.V3]:
      'border-theme-color-cabbage rounded-16 border  mt-8',
  };
};

const versionToButtonClassName: Record<
  PostFeedFiltersOnboardingVersion,
  string
> = {
  [PostFeedFiltersOnboardingVersion.V1]: 'ml-4 btn-secondary',
  [PostFeedFiltersOnboardingVersion.V2]:
    'btn-primary-cabbage text-white mt-4 mb-2',
  [PostFeedFiltersOnboardingVersion.V3]: 'btn-primary-cabbage text-white mt-4',
};
const versionToButtonSize: Record<
  PostFeedFiltersOnboardingVersion,
  ButtonSize
> = {
  [PostFeedFiltersOnboardingVersion.V1]: 'xsmall',
  [PostFeedFiltersOnboardingVersion.V2]: 'small',
  [PostFeedFiltersOnboardingVersion.V3]: 'small',
};
const versionToButtonText: Record<PostFeedFiltersOnboardingVersion, string> = {
  [PostFeedFiltersOnboardingVersion.V1]: 'Start now',
  [PostFeedFiltersOnboardingVersion.V2]: 'Customize',
  [PostFeedFiltersOnboardingVersion.V3]: 'Customize',
};
const versionToConditionalWrapperClassName: Record<
  PostFeedFiltersOnboardingVersion,
  string
> = {
  [PostFeedFiltersOnboardingVersion.V1]: '',
  [PostFeedFiltersOnboardingVersion.V2]: 'py-4 px-8',
  [PostFeedFiltersOnboardingVersion.V3]: 'py-3 px-4',
};

interface PostFeedFiltersOnboardingProps
  extends Pick<PostNavigationProps, 'postPreviousNext'> {
  hasNavigation: boolean;
  version: PostFeedFiltersOnboardingVersion;
}

export function PostFeedFiltersOnboarding({
  hasNavigation,
  version,
  postPreviousNext,
}: PostFeedFiltersOnboardingProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex',
        versionToWrapperClassName(hasNavigation)[version],
      )}
    >
      {version === PostFeedFiltersOnboardingVersion.V1 && (
        <IntegrationIcon size="medium" secondary className="mr-2" />
      )}
      <ConditionalWrapper
        condition={version !== PostFeedFiltersOnboardingVersion.V1}
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
        {version === PostFeedFiltersOnboardingVersion.V2 && (
          <div className={hasNavigation && 'flex gap-2 mb-8'}>
            {postPreviousNext}
          </div>
        )}
        <p className="font-bold typo-callout">
          Let&apos;s super-charge your feed with the content you actually read!
        </p>
        <Button
          className={versionToButtonClassName[version]}
          buttonSize={versionToButtonSize[version]}
        >
          {versionToButtonText[version]}
        </Button>
      </ConditionalWrapper>
      {version === PostFeedFiltersOnboardingVersion.V2 && (
        <div>
          <div>Row 2</div>
          <div>Python</div>
        </div>
      )}
      {version !== PostFeedFiltersOnboardingVersion.V1 && (
        <div>
          <div>JVM</div>
          <div>Data Science</div>
        </div>
      )}
    </div>
  );
}
