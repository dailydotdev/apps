import { useCallback, useEffect, useRef } from 'react';

type StartFn<T> = (params?: T) => void;

export default function useDebounce<T = unknown>(
  callback: StartFn<T>,
  delay: number,
): StartFn<T> {
  const timeoutRef = useRef<number>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => window.clearTimeout(timeoutRef.current);
  }, []);

  return useCallback(
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
}
