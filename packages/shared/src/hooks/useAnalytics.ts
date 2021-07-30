import { useEffect, useState } from 'react';
import {
  getAmplitudeClient,
  initAmplitude,
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
      // if amplitude is not initialized setUserId will not be defined
      if (amplitude.setUserId) {
        amplitude.setUserId(user?.id || null);
      }
    });
  }, [user]);

  useEffect(() => {
    if (trackingId && canLoadScripts && !showCookie) {
      loadAnalyticsScript();
      if (!initializedAmp) {
        setInitializedAmp(true);
        initAmplitude(user?.id || null, version);
      }
    }
  }, [trackingId, canLoadScripts, showCookie]);
}
