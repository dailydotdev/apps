import { MutableRefObject, useEffect, useRef } from 'react';
import listenToLifecycleEvents from '../../lib/lifecycle';
import { AnalyticsContextData } from './useAnalyticsContextData';
import { AnalyticsEvent } from './useAnalyticsQueue';

const ACTIVE_STATES = ['active', 'passive'];

const isActiveState = (state: string): boolean =>
  ACTIVE_STATES.indexOf(state) > -1;

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
        // Update events page state to active
        durationEventsQueue.current.forEach((value, key) => {
          if (
            value.page_state !== 'active' &&
            value.event_name !== 'page inactive'
          ) {
            durationEventsQueue.current.set(key, {
              ...value,
              page_state: 'active',
            });
          }
        });
      } else if (
        isActiveState(event.detail.oldState) &&
        !isActiveState(event.detail.newState)
      ) {
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
    const callback = (event: CustomEvent) =>
      lifecycleCallbackRef.current(event);
    window.addEventListener('statechange', callback);
    return () => window.removeEventListener('statechange', callback);
  }, []);
}
