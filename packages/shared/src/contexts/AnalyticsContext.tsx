import React, {
  ReactElement,
  ReactNode,
  createContext,
  useMemo,
  useEffect,
  MutableRefObject,
  useRef,
} from 'react';
import useAnalyticsQueue, { AnalyticsEvent } from '../hooks/useAnalyticsQueue';
import useAnalyticsSharedProps from '../hooks/useAnalyticsSharedProps';

export type AnalyticsContextData = {
  trackEvent: (event: AnalyticsEvent) => void;
  trackEventStart: (id: string, event: AnalyticsEvent) => void;
  trackEventEnd: (id: string, now?: Date) => void;
};

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
  children?: ReactNode;
};

const generateEventId = (now = new Date()): string =>
  `${now.getTime()}_${(Math.random() + 1).toString(36).substring(4)}`;

const getGlobalSharedProps = (): Partial<AnalyticsEvent> => ({
  screen_height: window.screen?.height,
  screen_width: window.screen?.width,
  page_referrer: document.referrer,
  window_height: window.innerHeight,
  window_width: window.innerWidth,
});

const generateEvent = (
  event: AnalyticsEvent,
  sharedPropsRef: MutableRefObject<Partial<AnalyticsEvent>>,
  page: string,
  now = new Date(),
): AnalyticsEvent => ({
  ...sharedPropsRef.current,
  ...getGlobalSharedProps(),
  event_timestamp: now,
  event_id: generateEventId(now),
  event_page: page,
  ...event,
});

export const AnalyticsContextProvider = ({
  app,
  version,
  children,
  getPage,
}: AnalyticsContextProviderProps): ReactElement => {
  const { pushToQueue, setCanSend, queueRef } = useAnalyticsQueue();
  const [sharedPropsRef, sharedPropsSet] = useAnalyticsSharedProps(
    app,
    version,
  );
  const durationEventsQueue = useRef<Map<string, AnalyticsEvent>>(new Map());
  const contextData = useMemo<AnalyticsContextData>(
    () => ({
      trackEvent(event: AnalyticsEvent) {
        pushToQueue([generateEvent(event, sharedPropsRef, getPage())]);
      },
      trackEventStart(id, event) {
        durationEventsQueue.current.set(
          id,
          generateEvent(event, sharedPropsRef, getPage()),
        );
      },
      trackEventEnd(id, now = new Date()) {
        const event = durationEventsQueue.current.get(id);
        if (event) {
          durationEventsQueue.current.delete(id);
          event.event_duration = Math.round(
            (now.getTime() - event.event_timestamp.getTime()) / 1000,
          );
          pushToQueue([event]);
        }
      },
    }),
    [sharedPropsRef, getPage, pushToQueue, durationEventsQueue],
  );

  // Add shared props to all events that were tracked before they were ready
  useEffect(() => {
    if (sharedPropsSet) {
      // In-place value update instead of mapping
      queueRef.current.forEach((event, i) => {
        queueRef.current[i] = {
          ...event,
          ...sharedPropsRef.current,
        };
      });
      durationEventsQueue.current.forEach((event, key) => {
        durationEventsQueue.current.set(key, {
          ...event,
          ...sharedPropsRef.current,
        });
      });
      setCanSend(true);
    }
  }, [sharedPropsSet]);

  return (
    <AnalyticsContext.Provider value={contextData}>
      {children}
    </AnalyticsContext.Provider>
  );
};
