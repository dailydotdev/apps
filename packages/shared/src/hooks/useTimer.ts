import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import useDebounceFn from './useDebounceFn';

type CallbackFn<T> = (params?: T) => void;
export interface UseTimerReturnProps {
  timer?: number;
  setTimer: Dispatch<SetStateAction<number>>;
  runTimer: () => void;
  clearTimer: () => void;
}
export default function useTimer<T = unknown>(
  callback: CallbackFn<T>,
  initialTimer: number,
): UseTimerReturnProps {
  const initRef = useRef(false);
  const [timer, setTimer] = useState(initialTimer);
  const [runTimer, clearTimer] = useDebounceFn(() => {
    if (timer > 0) {
      setTimer((_timer) => _timer - 1);
      runTimer();
    } else {
      if (callback) {
        callback();
      }
      clearTimer();
    }
  }, 1000);

  useEffect(() => {
    if (initRef.current) {
      return;
    }

    initRef.current = true;

    if (initialTimer > 0) {
      runTimer();
    }
  }, [initialTimer, runTimer]);

  return useMemo(
    () => ({
      timer,
      setTimer,
      runTimer,
      clearTimer,
    }),
    [timer, setTimer, runTimer, clearTimer],
  );
}
