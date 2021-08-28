import { MutableRefObject, useEffect, useRef } from 'react';
import listenToLifecycleEvents from '../../lib/lifecycle';
import { AnalyticsContextData } from './useAnalyticsContextData';
import { AnalyticsEvent } from './useAnalyticsQueue';

export default function useTrackLifecycleEvents(
  setEnabled: (enabled: boolean) => void,
  contextData: AnalyticsContextData,
  durationEventsQueue: MutableRefObject<Map<string, AnalyticsEvent>>,
  sendBeacon: () => void,
): void {
  const lifecycleCallbackRef = useRef<(event: CustomEvent) => void>();
  useEffect(() => {
    lifecycleCallbackRef.current = (event: CustomEvent) => {
      if (event.detail.newState === 'active') {
        setEnabled(true);
        contextData.trackEventEnd('page inactive');
      } else if (event.detail.oldState === 'active') {
        setEnabled(false);
        const now = new Date();
        durationEventsQueue.current.forEach((value, key) =>
          contextData.trackEventEnd(key, now),
        );
        sendBeacon();
        contextData.trackEventStart('page inactive', {
          event_name: 'page inactive',
        });
      }
    };
  }, [setEnabled, durationEventsQueue, contextData, sendBeacon]);

  useEffect(() => {
    listenToLifecycleEvents();
    window.addEventListener('statechange', (event: CustomEvent) =>
      lifecycleCallbackRef.current(event),
    );
  }, []);
}
