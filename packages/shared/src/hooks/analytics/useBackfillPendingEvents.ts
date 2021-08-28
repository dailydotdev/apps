import { MutableRefObject, useEffect } from 'react';
import { AnalyticsEvent } from './useAnalyticsQueue';

export default function useBackfillPendingEvents(
  sharedPropsRef: MutableRefObject<Partial<AnalyticsEvent>>,
  sharedPropsSet: boolean,
  queueRef: MutableRefObject<AnalyticsEvent[]>,
  durationEventsQueue: MutableRefObject<Map<string, AnalyticsEvent>>,
  setEnabled: (enabled: boolean) => void,
): void {
  // Add shared props to all events that were tracked before they were ready
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
  }, [sharedPropsSet]);
}
