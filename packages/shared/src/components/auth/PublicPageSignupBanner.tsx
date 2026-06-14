import type { ReactElement } from 'react';
import React from 'react';
import { useConditionalFeature, useViewSize, ViewSize } from '../../hooks';
import { useOnboardingActions } from '../../hooks/auth';
import { featurePublicSignupBanner } from '../../lib/featureManagement';
import { PostAuthBanner } from './PostAuthBanner';

export function PublicPageSignupBanner(): ReactElement | null {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { shouldShowAuthBanner } = useOnboardingActions();
  const shouldEvaluate = shouldShowAuthBanner && isLaptop;
  const { value: isEnabled } = useConditionalFeature({
    feature: featurePublicSignupBanner,
    shouldEvaluate,
  });

  if (!shouldEvaluate || !isEnabled) {
    return null;
  }

  return <PostAuthBanner />;
}
