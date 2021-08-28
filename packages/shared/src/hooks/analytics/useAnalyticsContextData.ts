import { MutableRefObject, useMemo } from 'react';
import { AnalyticsEvent, PushToQueueFunc } from './useAnalyticsQueue';

export type AnalyticsContextData = {
  trackEvent: (event: AnalyticsEvent) => void;
  trackEventStart: (id: string, event: AnalyticsEvent) => void;
  trackEventEnd: (id: string, now?: Date) => void;
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

export default function useAnalyticsContextData(
  pushToQueue: PushToQueueFunc,
  sharedPropsRef: MutableRefObject<Partial<AnalyticsEvent>>,
  getPage: () => string,
  durationEventsQueue: MutableRefObject<Map<string, AnalyticsEvent>>,
): AnalyticsContextData {
  return useMemo<AnalyticsContextData>(
    () => ({
      trackEvent(event: AnalyticsEvent) {
        pushToQueue([generateEvent(event, sharedPropsRef, getPage())]);
      },
      trackEventStart(id, event) {
        if (!durationEventsQueue.current.has(id)) {
          durationEventsQueue.current.set(
            id,
            generateEvent(event, sharedPropsRef, getPage()),
          );
        }
      },
      trackEventEnd(id, now = new Date()) {
        const event = durationEventsQueue.current.get(id);
        if (event) {
          durationEventsQueue.current.delete(id);
          event.event_duration =
            now.getTime() - event.event_timestamp.getTime();
          pushToQueue([event]);
        }
      },
    }),
    [sharedPropsRef, getPage, pushToQueue, durationEventsQueue],
  );
}
