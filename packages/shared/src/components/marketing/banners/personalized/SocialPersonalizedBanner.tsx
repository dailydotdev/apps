import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { AuthBannerLayout } from '../../../auth/AuthenticationBanner';
import {
  AuthenticationBanner,
  getAuthBannerHeadlineClassName,
} from '../../../auth/AuthenticationBanner';
import { OnboardingHeadline } from '../../../auth/OnboardingHeadline';
import { socialCTA, socialGradient } from '../../../../lib/socialMedia';
import type { SupportedSocialReferrer } from '../../../../lib/socialMedia';
import { capitalize } from '../../../../lib/strings';

const SocialPersonalizedBanner = ({
  site,
  compact,
  targetId,
  layout,
}: {
  site: SupportedSocialReferrer;
  compact?: boolean;
  targetId?: string;
  layout?: AuthBannerLayout;
}): ReactElement => {
  const headline = getAuthBannerHeadlineClassName({ compact, layout });

  return (
    <AuthenticationBanner compact={compact} targetId={targetId} layout={layout}>
      <OnboardingHeadline
        className={{
          ...headline,
          title: classNames(headline.title, socialGradient[site]),
        }}
        pretitle={`Coming from ${capitalize(site)}?`}
        {...socialCTA[site]}
      />
    </AuthenticationBanner>
  );
};

export default SocialPersonalizedBanner;
