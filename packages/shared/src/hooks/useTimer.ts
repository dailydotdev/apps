import { useMemo, useState } from 'react';
import useDebounce from './useDebounce';

export default function useTimer(callback, initialTimer: number) {
  const [timer, setTimer] = useState(initialTimer);
  const [runTimer, clearTimer] = useDebounce(() => {
    if (timer > 0) {
      setTimer((_timer) => _timer - 1);
      runTimer();
    } else {
      callback();
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
