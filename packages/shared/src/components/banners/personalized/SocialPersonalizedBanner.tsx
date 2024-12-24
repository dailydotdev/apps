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
import { capitalize } from '../../../lib/strings';
import { IconSize } from '../../Icon';
import { featurePostBannerExtensionPrompt } from '../../../lib/featureManagement';
import { useFeature } from '../../GrowthBookProvider';

const SocialPersonalizedBanner = ({
  site,
}: {
  site: SocialIconType;
}): ReactElement => {
  const Icon = socialIcon[site];
  const gradient = socialGradient[site];
  const extensionExperiment = useFeature(featurePostBannerExtensionPrompt);

  return (
    <AuthenticationBanner>
      {!extensionExperiment && (
        <Icon
          size={IconSize.Size48}
          secondary={site === SocialIconType.Reddit}
        />
      )}
      <OnboardingHeadline
        avatar={
          extensionExperiment && (
            <Icon
              size={IconSize.Size48}
              secondary={site === SocialIconType.Reddit}
            />
          )
        }
        className={{
          pretitle: extensionExperiment && ' typo-title2',
          title: classNames('typo-mega3', gradient),
          description: classNames(
            'typo-title3',
            !extensionExperiment && 'mb-8',
          ),
        }}
        pretitle={`Coming from ${capitalize(site)}?`}
        {...socialCTA[site]}
      />
    </AuthenticationBanner>
  );
};

export default SocialPersonalizedBanner;
