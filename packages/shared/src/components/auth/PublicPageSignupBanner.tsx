import type { ReactElement } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { useAuthContext } from '../../contexts/AuthContext';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { LogEvent, TargetId, TargetType } from '../../lib/log';

const PostAuthBanner = dynamic(() =>
  import(/* webpackChunkName: "postAuthBanner" */ './PostAuthBanner').then(
    (mod) => mod.PostAuthBanner,
  ),
);

interface PublicPageSignupBannerGate {
  /** Auth is unknown or anonymous on a laptop: the banner may end up showing. */
  mayShow: boolean;
  shouldShow: boolean;
}

// The one gate for the banner and for whatever else has to yield the
// window's bottom edge to it, so the two can never drift apart.
export const usePublicPageSignupBannerGate = (): PublicPageSignupBannerGate => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isAuthReady, user } = useAuthContext();
  const mayShow = isLaptop && (!isAuthReady || !user);

  return { mayShow, shouldShow: mayShow && isAuthReady };
};

// The post page's bottom banner on the public pages. It pins to the window,
// so it goes at the end of the page where its spacer keeps the last of the
// content reachable above it.
export function PublicPageSignupBanner(): ReactElement | null {
  const { shouldShow } = usePublicPageSignupBannerGate();

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
      <PostAuthBanner targetId={TargetId.PublicPageSignupBanner} />
    </>
  );
}
