import { useEffect, useState } from 'react';
import { IFlags } from 'flagsmith';
import {
  getAmplitudeClient,
  initAmplitude,
  initializeAnalyticsQueue,
  loadAnalyticsScript,
  trackPageView,
} from '../lib/analytics';
import { LoggedUser } from '../lib/user';

export default function useThirdPartyAnalytics(
  trackingId: string,
  user: LoggedUser,
  showCookie: boolean,
  canLoadScripts: boolean,
  version: string,
  getPage: () => string,
  flags: IFlags,
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
        initAmplitude(user?.id || null, version, flags);
      }
    }
  }, [trackingId, canLoadScripts, showCookie, flags]);
}
