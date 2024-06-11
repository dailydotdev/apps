import { MutableRefObject, useEffect } from 'react';
import { LogEvent } from './useLogQueue';

export default function useBackfillPendingLogs(
  sharedPropsRef: MutableRefObject<Partial<LogEvent>>,
  sharedPropsSet: boolean,
  queueRef: MutableRefObject<LogEvent[]>,
  durationEventsQueue: MutableRefObject<Map<string, LogEvent>>,
  setEnabled: (enabled: boolean) => void,
): void {
  // Add shared props to all events that were logged before they were ready
  useEffect(() => {
    if (sharedPropsSet) {
      // In-place value update instead of map to improve performance
      queueRef.current.forEach((event, i) => {
        // eslint-disable-next-line no-param-reassign
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
      setEnabled(true);
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedPropsSet]);
}
