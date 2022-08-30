import { useEffect } from 'react';

export interface MessageEventData {
  eventKey?: string;
}

type EventParameter = keyof WindowEventMap;
type KeyedWindowEventHandler<T = unknown> = (e: MessageEvent<T>) => void;

const useWindowEvents = <T extends MessageEventData = MessageEventData>(
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
