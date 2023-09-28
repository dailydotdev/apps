import { useEffect } from 'react';

export interface MessageEventData {
  eventKey?: string;
}

type EventParameter = keyof WindowEventMap | 'web-vitals';
type KeyedWindowEventHandler<T = unknown> = (e: MessageEvent<T>) => void;

const useWindowEvents = <T extends MessageEventData = MessageEventData>(
  event: EventParameter,
  key: string,
  func: KeyedWindowEventHandler<T>,
  validateKey = true,
): void => {
  useEffect(() => {
    const handler = (e: MessageEvent<T>) => {
      if (validateKey && (!e.data?.eventKey || e.data.eventKey !== key)) {
        return;
      }

      func(e);
    };

    globalThis?.window.addEventListener(event, handler);
    return () => globalThis?.window.removeEventListener(event, handler);
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, func]);
};

export default useWindowEvents;
