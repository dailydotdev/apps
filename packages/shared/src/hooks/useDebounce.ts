import { useCallback, useEffect, useRef } from 'react';

type StartFn = () => void;

export default function useDebounce(
  callback: () => unknown,
  delay: number,
): StartFn {
  const timeoutRef = useRef<number>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => window.clearTimeout(timeoutRef.current);
  }, []);

  return useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      callbackRef.current?.();
    }, delay);
  }, [delay, timeoutRef, callbackRef]);
}
