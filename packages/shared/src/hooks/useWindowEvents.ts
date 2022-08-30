import { useCallback, useEffect } from 'react';
import { AuthEvent } from '../lib/kratos';

export interface EventData {
  eventKey?: AuthEvent | string;
}

type EventParameter = keyof WindowEventMap;
type KeyedWindowEventHandler<T = unknown> = (e: MessageEvent<T>) => void;

const useWindowEvents = <T extends EventData = EventData>(
  event: EventParameter,
  func: KeyedWindowEventHandler<T>,
): void => {
  useEffect(() => {
    window.addEventListener(event, func);
    return () => window.removeEventListener(event, func);
  }, [event, func]);
};

export const useKeyedWindowEvent = <T extends EventData = EventData>(
  event: EventParameter,
  key: string,
  func: KeyedWindowEventHandler<T>,
): void => {
  useWindowEvents(
    event,
    useCallback(
      (e: MessageEvent<T>) => {
        if (!e.data?.eventKey || e.data.eventKey !== key) {
          return;
        }
        func(e);
      },
      [event, key, func],
    ),
  );
};

export default useWindowEvents;
