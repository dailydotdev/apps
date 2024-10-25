import { useCallback, useEffect, useRef } from 'react';

const useEffectEvent = <T extends (...args: any[]) => void>(handler: T): T => {
  const handlerRef = useRef<T>(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  const stableHandler = useCallback((...args: Parameters<T>) => {
    if (handlerRef.current) {
      handlerRef.current(...args);
    }
  }, []);

  return stableHandler as T;
};

export { useEffectEvent };
