import type { ReactElement } from 'react';
import React from 'react';
import { useViewSize, ViewSize } from '../../hooks';
import { useOnboardingActions } from '../../hooks/auth';
import { PostAuthBanner } from './PostAuthBanner';

export const usePublicPageSignupBanner = (): boolean => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { shouldShowAuthBanner } = useOnboardingActions();

  return shouldShowAuthBanner && isLaptop;
};

// The post page's bottom banner on the public pages. It pins to the window,
// so it goes at the end of the page where its spacer keeps the last of the
// content reachable above it.
export function PublicPageSignupBanner(): ReactElement | null {
  const shouldShow = usePublicPageSignupBanner();

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      <div aria-hidden className="h-72" />
      <PostAuthBanner />
    </>
  );
}
