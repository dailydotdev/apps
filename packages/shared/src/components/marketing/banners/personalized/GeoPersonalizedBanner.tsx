import type { ReactElement } from 'react';
import React from 'react';
import { geoToCountry } from '../../../../lib/geo';
import {
  AuthenticationBanner,
  authBannerHeadlineClassName,
} from '../../../auth/AuthenticationBanner';
import { OnboardingHeadline } from '../../../auth/OnboardingHeadline';

const GeoPersonalizedBanner = ({
  geo,
  targetId,
}: {
  geo: string;
  targetId?: string;
}): ReactElement => {
  const country = geoToCountry(geo);

  return (
    <AuthenticationBanner targetId={targetId}>
      <OnboardingHeadline
        className={authBannerHeadlineClassName}
        title={`daily.dev is the fastest growing developer platform in ${country}!`}
        description="We know how hard it is to be a developer. It doesn't have to be. Personalized news feed, dev community and search, much better than what's out there. Maybe ;)"
      />
    </AuthenticationBanner>
  );
};

export default GeoPersonalizedBanner;
