import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { AuthenticationBanner, OnboardingHeadline } from '../../auth';
import {
  socialCTA,
  socialGradient,
  socialIcon,
  SocialIconType,
} from '../../../lib/socialMedia';
import type { SupportedSocialReferrer } from '../../../lib/socialMedia';
import { capitalize } from '../../../lib/strings';
import { IconSize } from '../../Icon';

const SocialPersonalizedBanner = ({
  site,
  compact,
}: {
  site: SupportedSocialReferrer;
  compact?: boolean;
}): ReactElement => {
  const Icon = socialIcon[site];
  const gradient = socialGradient[site];

  return (
    <AuthenticationBanner compact={compact}>
      <Icon
        size={compact ? IconSize.Large : IconSize.Size48}
        secondary={site === SocialIconType.Reddit}
      />
      <OnboardingHeadline
        className={{
          title: classNames(
            compact ? 'typo-large-title' : 'typo-mega3',
            gradient,
          ),
          description: compact ? 'typo-body' : 'mb-8 typo-title3',
        }}
        pretitle={`Coming from ${capitalize(site)}?`}
        {...socialCTA[site]}
      />
    </AuthenticationBanner>
  );
};

export default SocialPersonalizedBanner;
