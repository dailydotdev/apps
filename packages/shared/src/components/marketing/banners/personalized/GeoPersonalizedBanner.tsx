import type { ReactElement } from 'react';
import React from 'react';
import { geoToCountry } from '../../../../lib/geo';
import type { AuthBannerLayout } from '../../../auth/AuthenticationBanner';
import {
  AuthenticationBanner,
  getAuthBannerHeadlineClassName,
} from '../../../auth/AuthenticationBanner';
import { OnboardingHeadline } from '../../../auth/OnboardingHeadline';

const GeoPersonalizedBanner = ({
  geo,
  compact,
  targetId,
  layout,
}: {
  geo: string;
  compact?: boolean;
  targetId?: string;
  layout?: AuthBannerLayout;
}): ReactElement => {
  const country = geoToCountry(geo);

  return (
    <AuthenticationBanner compact={compact} targetId={targetId} layout={layout}>
      <OnboardingHeadline
        className={getAuthBannerHeadlineClassName({ compact, layout })}
        title={`daily.dev is the fastest growing developer platform in ${country}!`}
        description="We know how hard it is to be a developer. It doesn't have to be. Personalized news feed, dev community and search, much better than what's out there. Maybe ;)"
      />
    </AuthenticationBanner>
  );
};

export default GeoPersonalizedBanner;
