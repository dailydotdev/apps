import { MutableRefObject, useMemo } from 'react';
import { LogEvent, PushToQueueFunc } from './useLogQueue';
import { getCurrentLifecycleState } from '../../lib/lifecycle';
import { Origin } from '../../lib/log';

export type LogContextData = {
  logEvent: (event: LogEvent) => void;
  logEventStart: (id: string, event: LogEvent) => void;
  logEventEnd: (id: string, now?: Date) => void;
  sendBeacon: () => void;
};

const generateEventId = (now = new Date()): string => {
  const randomStr = (Math.random() + 1).toString(36).substring(8);
  const timePart = (now.getTime() / 1000).toFixed(0);
  return `${timePart}${randomStr}`;
};

export type PostOrigin =
  | Origin.ArticlePage
  | Origin.ArticleModal
  | Origin.CollectionModal;

const getGlobalSharedProps = (): Partial<LogEvent> => ({
  screen_height: window.screen?.height,
  screen_width: window.screen?.width,
  page_referrer: document.referrer,
  window_height: window.innerHeight,
  window_width: window.innerWidth,
  page_state: getCurrentLifecycleState(),
});

const generateEvent = (
  event: LogEvent,
  sharedPropsRef: MutableRefObject<Partial<LogEvent>>,
  page: string,
  now = new Date(),
): LogEvent => ({
  ...sharedPropsRef.current,
  ...getGlobalSharedProps(),
  event_timestamp: now,
  event_id: generateEventId(now),
  event_page: page,
  ...event,
});

export default function useLogContextData(
  pushToQueue: PushToQueueFunc,
  sharedPropsRef: MutableRefObject<Partial<LogEvent>>,
  getPage: () => string,
  durationEventsQueue: MutableRefObject<Map<string, LogEvent>>,
  sendBeacon: () => void,
): LogContextData {
  return useMemo<LogContextData>(
    () => ({
      logEvent(event: LogEvent) {
        pushToQueue([generateEvent(event, sharedPropsRef, getPage())]);
      },
      logEventStart(id, event) {
        if (!durationEventsQueue.current.has(id)) {
          durationEventsQueue.current.set(
            id,
            generateEvent(event, sharedPropsRef, getPage()),
          );
        }
      },
      logEventEnd(id, now = new Date()) {
        const event = durationEventsQueue.current.get(id);
        if (event) {
          durationEventsQueue.current.delete(id);
          event.event_duration =
            now.getTime() - event.event_timestamp.getTime();
          if (window.scrollY > 0 && event.event_name !== 'page inactive') {
            event.page_state = 'active';
          }
          pushToQueue([event]);
        }
      },
      sendBeacon,
    }),
    [sharedPropsRef, getPage, pushToQueue, durationEventsQueue, sendBeacon],
  );
}
