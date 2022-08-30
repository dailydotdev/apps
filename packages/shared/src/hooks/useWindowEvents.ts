import { useEffect } from 'react';
import { AuthEvent } from '../lib/kratos';

interface EventData {
  eventKey?: AuthEvent | string;
}

type EventParameter = keyof WindowEventMap;
type KeyedWindowEventHandler<T = unknown> = (e: MessageEvent<T>) => void;

export interface SocialRegistrationFlow extends EventData {
  flow: string;
}

const useWindowEvents = <T extends EventData = EventData>(
  event: EventParameter,
  key: string,
  func: KeyedWindowEventHandler<T>,
): void => {
  useEffect(() => {
    const handler = (e: MessageEvent<T>) => {
      if (!e.data?.eventKey || e.data.eventKey !== key) {
        return;
      }

      func(e);
    };

    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
  }, [event, func]);
};

export default useWindowEvents;
