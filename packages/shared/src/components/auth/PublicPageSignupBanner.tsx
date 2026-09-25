import type { ReactElement } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { useOnboardingActions } from '../../hooks/auth/useOnboardingActions';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { LogEvent, TargetId, TargetType } from '../../lib/log';

const PostAuthBanner = dynamic(() =>
  import(/* webpackChunkName: "postAuthBanner" */ './PostAuthBanner').then(
    (mod) => mod.PostAuthBanner,
  ),
);

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

  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.SignupButton,
      target_id: TargetId.PublicPageSignupBanner,
    }),
    { condition: shouldShow },
  );

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
