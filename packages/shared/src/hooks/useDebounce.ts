import { useCallback, useEffect, useRef, useMemo } from 'react';

type StartFn<T> = (params?: T) => void;
type CancelEvent = () => void;

export default function useDebounce<T = unknown>(
  callback: StartFn<T>,
  delay: number,
): [StartFn<T>, CancelEvent] {
  const timeoutRef = useRef<number>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => window.clearTimeout(timeoutRef.current);
  }, []);

  const memoizedCallback = useCallback(
    (args) => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        callbackRef.current?.(args);
      }, delay);
    },
    [delay, timeoutRef, callbackRef],
  );

  const cancelCallback = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [timeoutRef]);

  return useMemo(
    () => [memoizedCallback, cancelCallback],
    [memoizedCallback, cancelCallback],
  );
}
