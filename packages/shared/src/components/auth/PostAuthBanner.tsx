import React, { ReactElement } from 'react';
import { feature } from '../../lib/featureManagement';
import { checkIsBrowser, checkIsExtension, UserAgent } from '../../lib/func';
import { AuthExtensionBanner } from './AuthExtensionBanner';
import { AuthenticationBanner } from './AuthenticationBanner';
import { useConditionalFeature } from '../../hooks';

export const PostAuthBanner = (): ReactElement => {
  const isCompatibleBrowser =
    (checkIsBrowser(UserAgent.Chrome) || checkIsBrowser(UserAgent.Edge)) &&
    !checkIsExtension();

  const { value: showExtensionCTA } = useConditionalFeature({
    feature: feature.postBannerExtensionPrompt,
    shouldEvaluate: isCompatibleBrowser,
  });

  if (showExtensionCTA) {
    return <AuthExtensionBanner />;
  }

  return <AuthenticationBanner />;
};
