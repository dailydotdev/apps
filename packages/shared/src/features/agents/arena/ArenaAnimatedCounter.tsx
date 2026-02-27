import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';

interface ArenaAnimatedCounterProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
}

export const ArenaAnimatedCounter = ({
  value,
  format,
  className,
  duration = 800,
}: ArenaAnimatedCounterProps): ReactElement => {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = value;

    if (from === to) {
      return undefined;
    }

    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - (1 - progress) * (1 - progress) * (1 - progress);
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  const formatted = format ? format(display) : display.toLocaleString();

  return <span className={className}>{formatted}</span>;
};
