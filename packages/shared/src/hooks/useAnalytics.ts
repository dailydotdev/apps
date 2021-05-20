import { useEffect, useState } from 'react';
import {
  getAmplitudeClient,
  initializeAnalyticsQueue,
  loadAnalyticsScript,
  trackPageView,
} from '../lib/analytics';
import { LoggedUser } from '../lib/user';

export default function useAnalytics(
  trackingId: string,
  user: LoggedUser,
  showCookie: boolean,
  canLoadScripts: boolean,
  version: string,
  getPage: () => string,
): void {
  const [initializedGA, setInitializedGA] = useState(false);
  const [initializedAmp, setInitializedAmp] = useState(false);

  useEffect(() => {
    if (trackingId && !initializedGA) {
      initializeAnalyticsQueue(trackingId);
      trackPageView(getPage());
      setInitializedGA(true);
    }
  }, [trackingId]);

  useEffect(() => {
    getAmplitudeClient().then((amplitude) => {
      amplitude.setUserId(user?.id || null);
    });
  }, [user]);

  useEffect(() => {
    if (trackingId && canLoadScripts && !showCookie) {
      loadAnalyticsScript();
      if (!initializedAmp) {
        setInitializedAmp(true);
        getAmplitudeClient().then((amplitude) => {
          amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE, user?.id, {
            includeReferrer: true,
            includeUtm: true,
            sameSiteCookie: 'Lax',
            domain: process.env.NEXT_PUBLIC_DOMAIN,
          });
          amplitude.setVersionName(version);
        });
      }
    }
  }, [trackingId, canLoadScripts, showCookie]);
}
