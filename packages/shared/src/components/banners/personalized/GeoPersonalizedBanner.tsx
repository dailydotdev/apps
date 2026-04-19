import type { ReactElement } from 'react';
import React from 'react';
import { geoToCountry, geoToEmoji } from '../../../lib/geo';
import { AuthenticationBanner, OnboardingHeadline } from '../../auth';

const GeoPersonalizedBanner = ({
  geo,
  compact,
}: {
  geo: string;
  compact?: boolean;
}): ReactElement => {
  const emoji = geoToEmoji(geo);
  const country = geoToCountry(geo);

  return (
    <AuthenticationBanner compact={compact}>
      <span
        className={
          compact ? 'text-[2.5rem] leading-none' : 'text-[3.5rem] leading-none'
        }
      >
        {emoji}
      </span>
      <OnboardingHeadline
        className={{
          title: compact ? 'typo-large-title' : 'typo-mega3',
          description: compact ? 'typo-body' : 'mb-8 typo-title3',
        }}
        title={`daily.dev is the fastest growing developer platform in ${country}!`}
        description="We know how hard it is to be a developer. It doesn't have to be. Personalized news feed, dev community and search, much better than what's out there. Maybe ;)"
      />
    </AuthenticationBanner>
  );
};

export default GeoPersonalizedBanner;
