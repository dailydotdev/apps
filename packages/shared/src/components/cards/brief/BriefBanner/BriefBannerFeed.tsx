import type { ComponentProps } from 'react';
import React, { useMemo, useRef, useEffect, useContext, useState } from 'react';
import { isToday } from 'date-fns';
import { BriefContextProvider, useBriefContext } from '../BriefContext';
import { BriefBanner } from './BriefBanner';
import AlertContext from '../../../../contexts/AlertContext';

const BriefBannerWithContext = ({ style, ...props }: ComponentProps<'div'>) => {
  const { brief } = useBriefContext();
  const { alerts, loadedAlerts, updateAlerts } = useContext(AlertContext);
  const bannerRef = useRef<HTMLDivElement>(null);
  const [bannerLastSeen, setBannerLastSeen] = useState<Date | null>(null);

  const shouldShowBanner = useMemo(() => {
    // Hide banner if brief was already created today
    if (brief && isToday(new Date(brief.createdAt))) {
      return false;
    }

    // Hide banner if user has already seen it today
    if (
      loadedAlerts &&
      alerts.briefBannerLastSeen &&
      isToday(new Date(alerts.briefBannerLastSeen))
    ) {
      return false;
    }

    // Show banner if no brief exists OR brief is from previous day
    return true;
  }, [brief, loadedAlerts, alerts.briefBannerLastSeen]);

  useEffect(() => {
    if (!shouldShowBanner || !bannerRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBannerLastSeen(new Date());
        }
      },
      { threshold: 1 },
    );

    observer.observe(bannerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [shouldShowBanner]);

  // Save banner seen state on page unload if user saw it
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (bannerLastSeen !== null) {
        updateAlerts({ briefBannerLastSeen: bannerLastSeen });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [bannerLastSeen, updateAlerts]);

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
