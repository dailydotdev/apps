import { useMutation } from 'react-query';
import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';
import { apiUrl } from '../lib/config';
import useDebounce from './useDebounce';

export type AnalyticsEvent = Record<string, unknown> & {
  visit_id?: string;
  event_timestamp?: Date;
  event_duration?: number;
};

type PushToQueueFunc = (events: AnalyticsEvent[]) => void;

export default function useAnalyticsQueue(): {
  pushToQueue: PushToQueueFunc;
  setCanSend: (boolean) => void;
  queueRef: MutableRefObject<AnalyticsEvent[]>;
} {
  const [canSend, setCanSend] = useState(false);
  const { mutateAsync: sendEvents } = useMutation(
    async (events: AnalyticsEvent[]) => {
      const res = await fetch(`${apiUrl}/e`, {
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
    const queue = queueRef.current;
    queueRef.current = [];
    sendEvents(queue);
  }, 1000);

  useEffect(() => {
    if (canSend && queueRef.current.length) {
      debouncedSendEvents();
    }
  }, [canSend]);

  return useMemo(
    () => ({
      pushToQueue: (events) => {
        queueRef.current.push(...events);
        if (canSend) {
          debouncedSendEvents();
        }
      },
      setCanSend,
      queueRef,
    }),
    [queueRef, debouncedSendEvents, canSend, setCanSend],
  );
}
