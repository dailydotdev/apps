import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import useDebounce from './useDebounce';

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
  const [timer, setTimer] = useState(initialTimer);
  const [runTimer, clearTimer] = useDebounce(() => {
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
