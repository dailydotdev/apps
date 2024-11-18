import React, { ReactElement } from 'react';
import { feature } from '../../lib/featureManagement';
import { checkIsBrowser, checkIsExtension, UserAgent } from '../../lib/func';
import { useFeaturesReadyContext } from '../GrowthBookProvider';
import { AuthExtensionBanner } from './AuthExtensionBanner';
import { AuthenticationBanner } from './AuthenticationBanner';

export const PostAuthBanner = (): ReactElement => {
  const { getFeatureValue } = useFeaturesReadyContext();
  const showExtensionCTA = getFeatureValue(feature.postBannerExtensionPrompt);
  const isCompatibleBrowser =
    (checkIsBrowser(UserAgent.Chrome) || checkIsBrowser(UserAgent.Edge)) &&
    !checkIsExtension();

  if (!showExtensionCTA || !isCompatibleBrowser) {
    return <AuthenticationBanner />;
  }

  return <AuthExtensionBanner />;
};
