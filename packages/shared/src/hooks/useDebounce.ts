import { useCallback, useEffect, useRef, useMemo } from 'react';

export type StartFn<T, R = void> = (params?: T) => R;
export type CancelEvent = () => void;

export default function useDebounce<T = unknown>(
  callback: StartFn<T>,
  delay: number,
  minimumTime?: number,
): [StartFn<T>, CancelEvent] {
  const timeoutRef = useRef<number>();
  const callbackRef = useRef(callback);
  const lastExecutionRef = useRef<Date>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => window.clearTimeout(timeoutRef.current);
  }, []);

  const memoizedCallback = useCallback(
    (args) => {
      // We should ensure the last execution + minimum time is less than the current time
      if (
        lastExecutionRef.current &&
        minimumTime &&
        lastExecutionRef.current.getTime() + minimumTime > new Date().getTime()
      ) {
        return;
      }
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        lastExecutionRef.current = new Date();
        timeoutRef.current = null;
        callbackRef.current?.(args);
      }, delay);
    },
    [delay, timeoutRef, callbackRef, lastExecutionRef, minimumTime],
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
