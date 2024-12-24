import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { geoToCountry, geoToEmoji } from '../../../lib/geo';
import { AuthenticationBanner, OnboardingHeadline } from '../../auth';
import { featurePostBannerExtensionPrompt } from '../../../lib/featureManagement';
import { useFeature } from '../../GrowthBookProvider';

const GeoPersonalizedBanner = ({ geo }: { geo: string }): ReactElement => {
  const emoji = geoToEmoji(geo);
  const country = geoToCountry(geo);
  const extensionExperiment = useFeature(featurePostBannerExtensionPrompt);

  return (
    <AuthenticationBanner>
      <span className="text-[3.5rem] leading-none">{emoji}</span>
      <OnboardingHeadline
        className={{
          title: `typo-mega3`,
          description: classNames(
            'typo-title3',
            !extensionExperiment && 'mb-8',
          ),
        }}
        title={`daily.dev is the fastest growing developer platform in ${country}!`}
        description="We know how hard it is to be a developer. It doesn't have to be. Personalized news feed, dev community and search, much better than what's out there. Maybe ;)"
      />
    </AuthenticationBanner>
  );
};

export default GeoPersonalizedBanner;
