import { useMutation } from 'react-query';
import { MutableRefObject, useMemo, useRef } from 'react';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';
import { apiUrl } from '../../lib/config';
import useDebounce from '../useDebounce';

export type AnalyticsEvent = Record<string, unknown> & {
  visit_id?: string;
  event_timestamp?: Date;
  event_duration?: number;
  event_name?: string;
  extra?: string;
};

export type PushToQueueFunc = (events: AnalyticsEvent[]) => void;

const ANALYTICS_ENDPOINT = `${apiUrl}/e`;

export default function useAnalyticsQueue(): {
  pushToQueue: PushToQueueFunc;
  setEnabled: (enabled: boolean) => void;
  queueRef: MutableRefObject<AnalyticsEvent[]>;
  sendBeacon: () => void;
} {
  const enabledRef = useRef(false);
  const { mutateAsync: sendEvents } = useMutation(
    async (events: AnalyticsEvent[]) => {
      const res = await fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ events }),
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
        },
      });
      await res.text();
    },
    {
      retry: 3,
    },
  );

  const queueRef = useRef<AnalyticsEvent[]>([]);
  const debouncedSendEvents = useDebounce(() => {
    requestIdleCallback(() => {
      if (enabledRef.current && queueRef.current.length) {
        const queue = queueRef.current;
        queueRef.current = [];
        sendEvents(queue);
      }
    });
  }, 100);

  return useMemo(
    () => ({
      pushToQueue: (events) => {
        queueRef.current.push(...events);
        if (enabledRef.current) {
          debouncedSendEvents();
        }
      },
      setEnabled: (enabled) => {
        enabledRef.current = enabled;
        if (enabled && queueRef.current.length) {
          debouncedSendEvents();
        }
      },
      queueRef,
      sendBeacon: () => {
        if (queueRef.current.length) {
          const events = queueRef.current;
          queueRef.current = [];
          const blob = new Blob([JSON.stringify({ events })], {
            type: 'application/json',
          });
          navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
        }
      },
    }),
    [queueRef, debouncedSendEvents, enabledRef],
  );
}
