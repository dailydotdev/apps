import { useEffect, useState } from 'react';

const getRemainingSeconds = (target: string | null | undefined): number => {
  if (!target) {
    return 0;
  }

  return Math.max(
    0,
    Math.ceil((new Date(target).getTime() - Date.now()) / 1000),
  );
};

export const useCountdownSeconds = (
  target: string | null | undefined,
): number => {
  const [seconds, setSeconds] = useState(() => getRemainingSeconds(target));

  useEffect(() => {
    if (!target) {
      setSeconds(0);
      return undefined;
    }

    const update = (): void => setSeconds(getRemainingSeconds(target));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [target]);

  return seconds;
};
