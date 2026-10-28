import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  AuthenticationBanner,
  authBannerHeadlineClassName,
} from '../../../auth/AuthenticationBanner';
import { OnboardingHeadline } from '../../../auth/OnboardingHeadline';
import { socialCTA, socialGradient } from '../../../../lib/socialMedia';
import type { SupportedSocialReferrer } from '../../../../lib/socialMedia';
import { capitalize } from '../../../../lib/strings';

const SocialPersonalizedBanner = ({
  site,
  targetId,
}: {
  site: SupportedSocialReferrer;
  targetId?: string;
}): ReactElement => {
  return (
    <AuthenticationBanner targetId={targetId}>
      <OnboardingHeadline
        className={{
          ...authBannerHeadlineClassName,
          title: classNames(
            authBannerHeadlineClassName.title,
            socialGradient[site],
          ),
        }}
        pretitle={`Coming from ${capitalize(site)}?`}
        {...socialCTA[site]}
      />
    </AuthenticationBanner>
  );
};

export default SocialPersonalizedBanner;
