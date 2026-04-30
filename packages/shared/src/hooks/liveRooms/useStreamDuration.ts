import { useEffect, useState } from 'react';

export const useStreamDuration = (
  referenceTime: string | null | undefined,
): number => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!referenceTime) {
      setElapsed(0);
      return undefined;
    }

    const referenceTimeMs = new Date(referenceTime).getTime();

    if (Number.isNaN(referenceTimeMs)) {
      setElapsed(0);
      return undefined;
    }

    const tick = () => {
      setElapsed(
        Math.max(0, Math.floor((Date.now() - referenceTimeMs) / 1000)),
      );
    };

    tick();
    const interval = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [referenceTime]);

  return elapsed;
};
