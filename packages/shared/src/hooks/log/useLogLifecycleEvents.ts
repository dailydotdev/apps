import { MutableRefObject, useEffect, useRef } from 'react';
import listenToLifecycleEvents from '../../lib/lifecycle';
import { LogContextData } from './useLogContextData';
import { LogEvent } from './useLogQueue';

const ACTIVE_STATES = ['active', 'passive'];

const isActiveState = (state: string): boolean =>
  ACTIVE_STATES.indexOf(state) > -1;

export default function useLogLifecycleEvents(
  setEnabled: (enabled: boolean) => void,
  contextData: LogContextData,
  durationEventsQueue: MutableRefObject<Map<string, LogEvent>>,
  sendBeacon: () => void,
): void {
  const lifecycleCallbackRef = useRef<(event: CustomEvent) => void>();
  useEffect(() => {
    lifecycleCallbackRef.current = (event: CustomEvent) => {
      if (event.detail.newState === 'active') {
        setEnabled(true);
        contextData.logEventEnd('page inactive');
        contextData.logEvent({
          event_name: 'page active',
        });
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
          contextData.logEventEnd(key, now),
        );
        sendBeacon();
        contextData.logEventStart('page inactive', {
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
