import { useEffect } from 'react';

export interface MessageEventData {
  eventKey?: string;
}

type EventParameter = keyof WindowEventMap;
type KeyedWindowEventHandler<T = unknown> = (e: MessageEvent<T>) => void;

interface OptionalProps {
  validateKey: boolean;
  enabled: boolean;
}

const useWindowEvents = <T extends MessageEventData = MessageEventData>(
  event: EventParameter,
  key: string,
  func: KeyedWindowEventHandler<T>,
  { validateKey = true, enabled = true }: Partial<OptionalProps> = {},
): void => {
  useEffect(() => {
    const handler = (e: MessageEvent<T>) => {
      if (
        !enabled ||
        (validateKey && (!e.data?.eventKey || e.data.eventKey !== key))
      ) {
        return;
      }

      func(e);
    };

    globalThis?.window.addEventListener(event, handler);
    return () => globalThis?.window.removeEventListener(event, handler);
  }, [event, func, validateKey, enabled, key]);
};

export default useWindowEvents;
