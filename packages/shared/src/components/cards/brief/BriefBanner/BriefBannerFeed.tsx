import type { ComponentProps } from 'react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { isToday } from 'date-fns';
import { useInView } from 'react-intersection-observer';
import { BriefContextProvider, useBriefContext } from '../BriefContext';
import { BriefBanner } from './BriefBanner';
import { useAlertsContext } from '../../../../contexts/AlertContext';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useEventListener } from '../../../../hooks';

const BriefBannerWithContext = ({ style, ...props }: ComponentProps<'div'>) => {
  const { brief } = useBriefContext();
  const { alerts, loadedAlerts, updateAlerts } = useAlertsContext();
  const bannerLastSeenRef = useRef<Date | null>(null);
  const { user, isLoggedIn, isAuthReady } = useAuthContext();
  const shouldShowBanner = useMemo(() => {
    if (!isLoggedIn || !isAuthReady) {
      return false;
    }

    const hasTodayBrief = brief && isToday(new Date(brief.createdAt));
    const haveSeenBannerToday =
      loadedAlerts &&
      alerts.briefBannerLastSeen &&
      isToday(new Date(alerts.briefBannerLastSeen));

    return !user.isPlus && !hasTodayBrief && !haveSeenBannerToday;
  }, [
    isLoggedIn,
    isAuthReady,
    brief,
    loadedAlerts,
    alerts.briefBannerLastSeen,
    user?.isPlus,
  ]);

  const saveBannerState = useCallback(() => {
    if (bannerLastSeenRef.current !== null) {
      updateAlerts({ briefBannerLastSeen: bannerLastSeenRef.current });
      bannerLastSeenRef.current = null;
    }
  }, [updateAlerts]);

  const { ref: bannerRef, inView } = useInView({
    threshold: 1,
    skip: !shouldShowBanner,
  });

  useEffect(() => {
    if (inView && shouldShowBanner && bannerLastSeenRef.current === null) {
      bannerLastSeenRef.current = new Date();
    }
  }, [inView, shouldShowBanner]);

  // Save banner seen state on page unload if user saw it
  useEventListener(window, 'beforeunload', saveBannerState, {
    passive: true,
    once: true,
  });

  // Save banner state on component unmount (SPA navigation)
  useEffect(() => {
    return () => {
      saveBannerState();
    };
  }, [saveBannerState]);

  return shouldShowBanner ? (
    <div ref={bannerRef} style={style} data-testid="brief-banner-feed">
      <BriefBanner {...props} />
    </div>
  ) : null;
};

export const BriefBannerFeed = (props: ComponentProps<'div'>) => {
  return (
    <BriefContextProvider>
      <BriefBannerWithContext {...props} />
    </BriefContextProvider>
  );
};
