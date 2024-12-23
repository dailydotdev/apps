import { useMutation } from '@tanstack/react-query';
import { MutableRefObject, useMemo, useRef } from 'react';
import { apiUrl } from '../../lib/config';
import useDebounceFn from '../useDebounceFn';
import { ExtensionMessageType } from '../../lib/extension';
import usePersistentContext from '../usePersistentContext';
import {
  FIREFOX_ACCEPTED_PERMISSION,
  FirefoxPermissionType,
} from '../../lib/cookie';

export interface LogEvent extends Record<string, unknown> {
  visit_id?: string;
  event_timestamp?: Date;
  event_duration?: number;
  event_name: string;
  extra?: string;
  device_id?: string;
  cookies?: string;
}

export type PushToQueueFunc = (events: LogEvent[]) => void;

const LOG_ENDPOINT = `${apiUrl}/e`;

type UseLogQueueProps = {
  fetchMethod: typeof fetch;
  backgroundMethod?: (msg: unknown) => Promise<unknown>;
};
export default function useLogQueue({
  fetchMethod,
  backgroundMethod,
}: UseLogQueueProps): {
  pushToQueue: PushToQueueFunc;
  setEnabled: (enabled: boolean) => void;
  queueRef: MutableRefObject<LogEvent[]>;
  sendBeacon: () => void;
} {
  const isFirefoxExtension = process.env.TARGET_BROWSER === 'firefox';
  const [permission] = usePersistentContext<FirefoxPermissionType>(
    FIREFOX_ACCEPTED_PERMISSION,
  );
  const enabledRef = useRef(false);
  const { mutateAsync: sendEvents } = useMutation({
    mutationFn: async (events: LogEvent[]) => {
      const res = await fetchMethod(LOG_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ events }),
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
        },
      });
      await res?.text();
    },
    retry: 3,
  });

  const queueRef = useRef<LogEvent[]>([]);
  const [debouncedSendEvents] = useDebounceFn(() => {
    if (enabledRef.current && queueRef.current.length) {
      const queue = queueRef.current;
      queueRef.current = [];
      sendEvents(queue);
    }
  }, 500);

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
        if (
          isFirefoxExtension &&
          permission !== FirefoxPermissionType.Accepted
        ) {
          return;
        }

        if (queueRef.current.length) {
          const events = queueRef.current;
          queueRef.current = [];
          const blob = new Blob([JSON.stringify({ events })], {
            type: 'application/json',
          });
          if (backgroundMethod) {
            backgroundMethod?.({
              url: LOG_ENDPOINT,
              type: ExtensionMessageType.FetchRequest,
              args: {
                body: JSON.stringify({ events }),
                credentials: 'include',
                method: 'POST',
                headers: {
                  'content-type': 'application/json',
                },
              },
            });
          } else {
            navigator.sendBeacon(LOG_ENDPOINT, blob);
          }
        }
      },
    }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queueRef, debouncedSendEvents, enabledRef, permission, isFirefoxExtension],
  );
}
