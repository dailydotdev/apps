import React, { ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
import { Button } from './buttons/Button';
import { ScrollOnboardingVersion } from '../lib/featureValues';
import { cloudinary } from '../lib/image';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../lib/analytics';
import SuperchargeIcon from '../../icons/supercharge.svg';

type ScrollOnboardingVersionMap = Partial<
  Record<ScrollOnboardingVersion, string>
>;

const versionToContainerClassName: ScrollOnboardingVersionMap = {
  [ScrollOnboardingVersion.V1]: 'h-48 my-5',
  [ScrollOnboardingVersion.V2]: 'h-80 m-10',
};
const versionToButtonClassName: ScrollOnboardingVersionMap = {
  [ScrollOnboardingVersion.V1]: 'w-[16.25rem]',
  [ScrollOnboardingVersion.V2]: 'w-40',
};
const versionToButtonText: ScrollOnboardingVersionMap = {
  [ScrollOnboardingVersion.V1]: 'Customize your feed',
  [ScrollOnboardingVersion.V2]: 'Start',
};

const versionToGaussianBlurClassName: ScrollOnboardingVersionMap = {
  [ScrollOnboardingVersion.V1]: 'top-0 right-0 bottom-0 left-0 m-auto',
  [ScrollOnboardingVersion.V2]: '',
};

const GaussianBlur = ({
  version,
}: {
  version: ScrollOnboardingVersion;
}): ReactElement => {
  return (
    <div
      className={classNames(
        'absolute w-48 h-48 rounded-full blur-2xl opacity-[0.2] bg-theme-color-cabbage',
        versionToGaussianBlurClassName[version],
      )}
    />
  );
};

interface ScrollFeedFiltersOnboardingProps {
  version: ScrollOnboardingVersion;
  onInitializeOnboarding: () => void;
}
export default function ScrollFeedFiltersOnboarding({
  version,
  onInitializeOnboarding,
}: ScrollFeedFiltersOnboardingProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  useEffect(() => {
    trackEvent({
      event_name: AnalyticsEvent.EligibleScrollBlock,
      target_id: version,
    });
  }, [version]);

  if (version === ScrollOnboardingVersion.Control) {
    return null;
  }

  return (
    <div
      className={classNames(
        'flex flex-1 justify-center items-center relative',
        versionToContainerClassName[version],
      )}
      style={{
        background:
          'linear-gradient(180deg, #04131e00 0%, #04131eb3 20%, #0e1217 100%)',
      }}
    >
      <div className="flex flex-col items-center">
        {version === ScrollOnboardingVersion.V1 ? (
          <GaussianBlur version={version} />
        ) : (
          <div className="flex relative justify-center items-center mb-10">
            <GaussianBlur version={version} />
            <SuperchargeIcon className="w-[4.625rem] h-[4.625rem]" />
          </div>
        )}
        {version === ScrollOnboardingVersion.V2 && (
          <h2 className="mb-6 font-bold typo-title2">
            Supercharge your feed with
            <br /> content you&apos;ll love reading!
          </h2>
        )}
        <Button
          className={classNames(
            'text-white btn-primary-cabbage ',
            versionToButtonClassName[version],
          )}
          buttonSize="large"
          onClick={onInitializeOnboarding}
        >
          {versionToButtonText[version]}
        </Button>
      </div>
      {version === ScrollOnboardingVersion.V2 && (
        <img
          src={cloudinary.feedFilters.scroll}
          alt="example topics for your feed"
          className="laptop:hidden laptopL:block ml-2"
        />
      )}
    </div>
  );
}
