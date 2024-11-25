import React, { type ReactElement } from 'react';
import classNames from 'classnames';
import { AuthenticationBanner, OnboardingHeadline } from '../../auth';
import {
  socialCTA,
  socialGradient,
  socialIcon,
  type SocialIconType,
} from '../../../lib/socialMedia';
import { capitalize } from '../../../lib/strings';
import { IconSize } from '../../Icon';

const SocialPersonalizedBanner = ({
  site,
}: {
  site: SocialIconType;
}): ReactElement => {
  const Icon = socialIcon[site];
  const gradient = socialGradient[site];
  return (
    <AuthenticationBanner>
      <Icon size={IconSize.XXLarge} secondary={site === 'reddit'} />
      <OnboardingHeadline
        className={{
          title: classNames('typo-mega3', gradient),
          description: 'mb-8 typo-title3',
        }}
        pretitle={`Coming from ${capitalize(site)}?`}
        {...socialCTA[site]}
      />
    </AuthenticationBanner>
  );
};

export default SocialPersonalizedBanner;
