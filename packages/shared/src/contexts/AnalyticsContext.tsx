import React, { ReactElement, ReactNode, createContext, useRef } from 'react';
import useAnalyticsQueue, {
  AnalyticsEvent,
} from '../hooks/analytics/useAnalyticsQueue';
import useAnalyticsSharedProps from '../hooks/analytics/useAnalyticsSharedProps';
import useAnalyticsContextData, {
  AnalyticsContextData,
} from '../hooks/analytics/useAnalyticsContextData';
import useBackfillPendingEvents from '../hooks/analytics/useBackfillPendingEvents';
import useTrackLifecycleEvents from '../hooks/analytics/useTrackLifecycleEvents';

const AnalyticsContext = createContext<AnalyticsContextData>({
  trackEvent: () => {},
  trackEventStart: () => {},
  trackEventEnd: () => {},
});
export default AnalyticsContext;

export type AnalyticsContextProviderProps = {
  app: string;
  getPage: () => string;
  version?: string;
  method?: typeof fetch;
  deviceId?: string;
  children?: ReactNode;
};

export const AnalyticsContextProvider = ({
  app,
  version,
  children,
  method = fetch,
  deviceId,
  getPage,
}: AnalyticsContextProviderProps): ReactElement => {
  const { pushToQueue, setEnabled, queueRef, sendBeacon } = useAnalyticsQueue({
    method,
  });
  const [sharedPropsRef, sharedPropsSet] = useAnalyticsSharedProps(
    app,
    version,
    deviceId,
  );
  const durationEventsQueue = useRef<Map<string, AnalyticsEvent>>(new Map());
  const contextData = useAnalyticsContextData(
    pushToQueue,
    sharedPropsRef,
    getPage,
    durationEventsQueue,
  );
  useBackfillPendingEvents(
    sharedPropsRef,
    sharedPropsSet,
    queueRef,
    durationEventsQueue,
    setEnabled,
  );
  useTrackLifecycleEvents(
    setEnabled,
    contextData,
    durationEventsQueue,
    sendBeacon,
  );

  return (
    <AnalyticsContext.Provider value={contextData}>
      {children}
    </AnalyticsContext.Provider>
  );
};
