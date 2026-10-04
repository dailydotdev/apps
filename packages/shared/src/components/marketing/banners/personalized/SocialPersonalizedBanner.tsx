import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { AuthenticationBanner, OnboardingHeadline } from '../../../auth';
import { socialCTA, socialGradient } from '../../../../lib/socialMedia';
import type { SupportedSocialReferrer } from '../../../../lib/socialMedia';
import { capitalize } from '../../../../lib/strings';

const SocialPersonalizedBanner = ({
  site,
  compact,
  targetId,
}: {
  site: SupportedSocialReferrer;
  compact?: boolean;
  targetId?: string;
}): ReactElement => {
  const gradient = socialGradient[site];

  return (
    <AuthenticationBanner compact={compact} targetId={targetId}>
      <OnboardingHeadline
        className={{
          title: classNames(
            compact ? 'typo-large-title' : 'typo-mega3',
            gradient,
          ),
          description: compact ? 'typo-body' : 'typo-title3',
        }}
        pretitle={`Coming from ${capitalize(site)}?`}
        {...socialCTA[site]}
      />
    </AuthenticationBanner>
  );
};

export default SocialPersonalizedBanner;
